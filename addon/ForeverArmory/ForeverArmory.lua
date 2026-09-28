-- Forever Armory: user-initiated, read-only character export. Local storage cache; no network.
local function safe(fn, ...)
    if type(fn) ~= "function" then return nil end
    local ok, a, b, c, d, e, f = pcall(fn, ...)
    if ok then return a, b, c, d, e, f end
end
local function plain(v)
    if issecretvalue and issecretvalue(v) then return nil end
    if type(v) == "string" or type(v) == "number" then return v end
end
local function quote(s)
    return '"' .. tostring(s):gsub('[%z\1-\31\\"]', function(c)
        if c == '"' then return '\\"' end
        if c == '\\' then return '\\\\' end
        return string.format('\\u%04x', string.byte(c))
    end) .. '"'
end
local arrayMeta = {}
local function array() return setmetatable({}, arrayMeta) end
local function json(v)
    local t = type(v)
    if t == "nil" then return "null" end
    if t == "boolean" then return v and "true" or "false" end
    if t == "number" then return tostring(v) end
    if t == "string" then return quote(v) end
    if t == "table" then
        local parts = {}
        if getmetatable(v) == arrayMeta then
            for _, value in ipairs(v) do parts[#parts + 1] = json(value) end
            return '[' .. table.concat(parts, ',') .. ']'
        end
        for key, value in pairs(v) do parts[#parts + 1] = quote(key) .. ':' .. json(value) end
        table.sort(parts)
        return '{' .. table.concat(parts, ',') .. '}'
    end
    return "null"
end
local function idFromLink(link)
    local id = type(link) == "string" and link:match("item:(%d+)")
    return id and tonumber(id) or nil
end
local function nameFromLink(link)
    return type(link) == "string" and link:match('%[(.-)%]') or nil
end
local function itemInfo(id, link, quality, icon, count)
    local name = nameFromLink(link)
    if id and GetItemInfo then
        local loadedName, loadedLink, loadedQuality, _, _, _, _, _, _, loadedIcon = safe(GetItemInfo, id)
        name = plain(loadedName) or name
        link = plain(loadedLink) or link
        quality = plain(loadedQuality) or quality
        icon = plain(loadedIcon) or icon
    end
    return {id=id,name=name or (id and ("Item " .. id) or "Unknown item"),link=link,quality=quality,icon=icon,count=count or 1}
end
local function containerSlots(bag)
    if C_Container and C_Container.GetContainerNumSlots then return safe(C_Container.GetContainerNumSlots, bag) end
    return safe(GetContainerNumSlots, bag)
end
local function containerEntry(bag, slot)
    if C_Container and C_Container.GetContainerItemInfo then
        local info = safe(C_Container.GetContainerItemInfo, bag, slot)
        if type(info) == "table" then
            local link = plain(info.hyperlink) or (C_Container.GetContainerItemLink and plain(safe(C_Container.GetContainerItemLink, bag, slot)))
            local id = plain(info.itemID) or idFromLink(link)
            return id and itemInfo(id, link, plain(info.quality), plain(info.iconFileID), plain(info.stackCount) or 1) or nil
        end
    end
    local texture, count, _, quality = safe(GetContainerItemInfo, bag, slot)
    local link = plain(safe(GetContainerItemLink, bag, slot))
    local id = idFromLink(link)
    if not id and GetContainerItemID then id = plain(safe(GetContainerItemID, bag, slot)) end
    return id and itemInfo(id, link, plain(quality), plain(texture), plain(count) or 1) or nil
end
-- Storage snapshots are retained locally per character and exported only at the player's request.
-- Unknown APIs or unopened storage are never reported as an empty container.
local bankOpen, mailOpen, auctionOpen, guildOpen = false, false, false, false
local function stamp() return date("!%Y-%m-%dT%H:%M:%SZ") end
local function cache()
    ForeverArmoryStorage = ForeverArmoryStorage or {}
    local key = tostring(safe(UnitName,"player")) .. ":" .. tostring(safe(GetRealmName))
    ForeverArmoryStorage[key] = ForeverArmoryStorage[key] or {}
    return ForeverArmoryStorage[key]
end
local function containerSnapshot(location, bags)
    if not ((C_Container and C_Container.GetContainerNumSlots) or GetContainerNumSlots) then return nil end
    local snapshot={location=location,observedAt=stamp(),complete=true,source="Forever Armory addon",items=array()}
    for _,bag in ipairs(bags) do
        local slots=containerSlots(bag)
        if type(slots)~="number" then return nil end
        for slot=1,slots do
            local item=containerEntry(bag,slot)
            if item then item.bag=bag;item.slot=slot;snapshot.items[#snapshot.items+1]=item end
        end
    end
    return snapshot
end
local function captureStorage()
    local saved=cache()
    if bankOpen then saved.bank=containerSnapshot("bank",{-1,5,6,7,8,9,10,11}) or saved.bank end
    if mailOpen and GetInboxNumItems and GetInboxItemLink and GetInboxItem then
        local count=safe(GetInboxNumItems)
        if type(count)=="number" then
            local snapshot={location="mail",observedAt=stamp(),complete=false,source="Loaded mailbox attachments",items=array()}
            for message=1,count do
                for attachment=1,(ATTACHMENTS_MAX_RECEIVE or 12) do
                    local link=plain(safe(GetInboxItemLink,message,attachment))
                    local _,_,_,quantity=safe(GetInboxItem,message,attachment)
                    local id=idFromLink(link)
                    if id then local item=itemInfo(id,link,nil,nil,plain(quantity) or 1);item.slot=attachment;item.bag=message;snapshot.items[#snapshot.items+1]=item end
                end
            end
            saved.mail=snapshot
        end
    end
    if auctionOpen and GetNumAuctionItems and GetAuctionItemLink and GetAuctionItemInfo then
        local count=safe(GetNumAuctionItems,"owner")
        if type(count)=="number" then
            local snapshot={location="auction",observedAt=stamp(),complete=false,source="Loaded owner auctions",items=array()}
            for index=1,count do
                local link=plain(safe(GetAuctionItemLink,"owner",index))
                local _,_,quantity,quality=safe(GetAuctionItemInfo,"owner",index)
                local id=idFromLink(link)
                if id then snapshot.items[#snapshot.items+1]=itemInfo(id,link,plain(quality),nil,plain(quantity) or 1) end
            end
            saved.auction=snapshot
        end
    end
    if guildOpen and GetCurrentGuildBankTab and GetGuildBankItemLink and GetGuildBankItemInfo then
        local tab=safe(GetCurrentGuildBankTab)
        local guild=plain(safe(GetGuildInfo,"player"))
        if type(tab)=="number" and tab>0 and guild then
            local snapshot={location="guild-bank",scopeId=guild..":"..tostring(safe(GetRealmName))..":tab-"..tab,observedAt=stamp(),complete=false,source="Viewed guild-bank tab",items=array()}
            for slot=1,98 do
                local link=plain(safe(GetGuildBankItemLink,tab,slot))
                local _,quantity=safe(GetGuildBankItemInfo,tab,slot)
                local id=idFromLink(link)
                if id then local item=itemInfo(id,link,nil,nil,plain(quantity) or 1);item.slot=slot;snapshot.items[#snapshot.items+1]=item end
            end
            saved["guild-tab-"..tab]=snapshot
        end
    end
    return saved
end
local function readInventory(out)
    local bags=containerSnapshot("bags",{0,1,2,3,4})
    out.inventories=array()
    if bags then out.inventories[#out.inventories+1]=bags
    else out.warnings[#out.warnings+1]="Bag APIs unavailable; no bag snapshot exported." end
    local saved=captureStorage()
    -- SavedVariables lose array metatables across sessions; restore them before serializing.
    for _,snapshot in pairs(saved) do
        if snapshot.items then setmetatable(snapshot.items,arrayMeta);out.inventories[#out.inventories+1]=snapshot end
    end
    if not saved.bank then out.warnings[#out.warnings+1]="Bank not captured. Visit the bank and export while it is open." end
    if not saved.mail then out.warnings[#out.warnings+1]="Mailbox not captured or API unavailable." end
    if not saved.auction then out.warnings[#out.warnings+1]="Auctions not captured or owner-auction API unavailable." end
    out.warnings[#out.warnings+1]="Shared account-bank API not implemented. Cached storage retains its original observation time; mailbox, auctions and guild tabs may be partial."
end
local events=CreateFrame("Frame")
for _,event in ipairs({"BANKFRAME_OPENED","BANKFRAME_CLOSED","MAIL_SHOW","MAIL_CLOSED","AUCTION_HOUSE_SHOW","AUCTION_HOUSE_CLOSED","GUILDBANKFRAME_OPENED","GUILDBANKFRAME_CLOSED"}) do pcall(events.RegisterEvent,events,event) end
events:SetScript("OnEvent",function(_,event)
    if event=="BANKFRAME_OPENED" then bankOpen=true end
    if event=="BANKFRAME_CLOSED" then bankOpen=false end
    if event=="MAIL_SHOW" then mailOpen=true end
    if event=="MAIL_CLOSED" then mailOpen=false end
    if event=="AUCTION_HOUSE_SHOW" then auctionOpen=true end
    if event=="AUCTION_HOUSE_CLOSED" then auctionOpen=false end
    if event=="GUILDBANKFRAME_OPENED" then guildOpen=true end
    if event=="GUILDBANKFRAME_CLOSED" then guildOpen=false end
end)
local function readTalents(out)
    if C_ClassTalents and C_Traits then
        local configID = safe(C_ClassTalents.GetActiveConfigID)
        local config = configID and safe(C_Traits.GetConfigInfo, configID)
        if config and config.treeIDs then
            local seen = {}
            for _, treeID in ipairs(config.treeIDs) do
                for _, nodeID in ipairs(safe(C_Traits.GetTreeNodes, treeID) or {}) do
                    local node = safe(C_Traits.GetNodeInfo, configID, nodeID)
                    local rank = node and plain(node.ranksPurchased)
                    if rank and rank > 0 and not seen[nodeID] then
                        seen[nodeID] = true
                        local active = node.activeEntry
                        local entry = active and safe(C_Traits.GetEntryInfo, configID, active.entryID)
                        local def = entry and safe(C_Traits.GetDefinitionInfo, entry.definitionID)
                        local spell = def and def.spellID
                        local name = spell and C_Spell and safe(C_Spell.GetSpellName, spell)
                        out.talents[#out.talents + 1] = {name=plain(name) or ("Talent node " .. nodeID), rank=rank}
                    end
                end
            end
            return true
        end
    end
    if GetNumTalentTabs and GetNumTalents and GetTalentInfo then
        for tab = 1, (safe(GetNumTalentTabs) or 0) do
            for i = 1, (safe(GetNumTalents, tab) or 0) do
                local name, _, _, _, rank = safe(GetTalentInfo, tab, i)
                rank = plain(rank)
                if rank and rank > 0 then out.talents[#out.talents + 1] = {name=plain(name) or "Talent",rank=rank} end
            end
        end
        return true
    end
    return false
end
local function capture()
    local _, class = safe(UnitClass, "player")
    local race = safe(UnitRace, "player")
    local out = {
        name=plain(safe(UnitName, "player")), realm=plain(safe(GetRealmName)),
        class=plain(class), race=plain(race), faction=plain(safe(UnitFactionGroup, "player")),
        level=plain(safe(UnitLevel, "player")), xp=plain(safe(UnitXP, "player")),
        xpMax=plain(safe(UnitXPMax, "player")), money=plain(safe(GetMoney)),
        zone=plain(safe(GetZoneText)), observedAt=date("!%Y-%m-%dT%H:%M:%SZ"),
        professions=array(), gear=array(), inventory=array(), talents=array(), warnings=array()
    }
    if not out.name or not out.realm or not out.class or not out.level then error("Core character data is unavailable. Try again outside combat.") end
    if not GetInventoryItemID or not GetInventoryItemLink then
        out.warnings[#out.warnings + 1] = "Equipment APIs unavailable in this client."
    else
        for slot=1,19 do
            local id = plain(safe(GetInventoryItemID, "player", slot))
            if id then
                local link = plain(safe(GetInventoryItemLink, "player", slot))
                local quality = plain(safe(GetInventoryItemQuality, "player", slot))
                local icon = plain(safe(GetInventoryItemTexture, "player", slot))
                local item = itemInfo(id, link, quality, icon, 1)
                item.slot = slot
                out.gear[#out.gear+1] = item
                if not link and C_Item and C_Item.RequestLoadItemDataByID then safe(C_Item.RequestLoadItemDataByID,id) end
            end
        end
    end
    readInventory(out)
    if GetProfessions and GetProfessionInfo then
        local a,b,c,d,e = safe(GetProfessions)
        for _, index in ipairs({a or 0,b or 0,c or 0,d or 0,e or 0}) do
            if index > 0 then
                local name, _, rank, max = safe(GetProfessionInfo,index)
                if plain(name) then out.professions[#out.professions+1]={name=plain(name),rank=plain(rank),max=plain(max)} end
            end
        end
    else out.warnings[#out.warnings+1]="Profession APIs unavailable in this client." end
    local ok, supported = pcall(readTalents,out)
    if not ok or not supported then out.warnings[#out.warnings+1]="Talent data could not be fully read in this client." end
    if out.money == nil then out.warnings[#out.warnings+1]="Gold could not be captured." end
    if out.xp == nil then out.warnings[#out.warnings+1]="XP could not be captured." end
    return json({format="forever-armory",version=1,character=out})
end
local frame
local function showExport()
    if InCombatLockdown and InCombatLockdown() then print("Forever Armory: export after leaving combat.") return end
    local ok, text = pcall(capture)
    if not ok then print("Forever Armory: " .. tostring(text)) return end
    if not frame then
        frame=CreateFrame("Frame","ForeverArmoryExportFrame",UIParent,"BackdropTemplate")
        frame:SetSize(620,420);frame:SetPoint("CENTER");frame:SetFrameStrata("DIALOG")
        frame:SetBackdrop({bgFile="Interface\\DialogFrame\\UI-DialogBox-Background",edgeFile="Interface\\DialogFrame\\UI-DialogBox-Border",tile=true,tileSize=32,edgeSize=32,insets={left=10,right=10,top=10,bottom=10}})
        frame:EnableMouse(true);frame:SetMovable(true);frame:RegisterForDrag("LeftButton")
        frame:SetScript("OnDragStart",frame.StartMoving);frame:SetScript("OnDragStop",frame.StopMovingOrSizing)
        local title=frame:CreateFontString(nil,"OVERLAY","GameFontNormalLarge");title:SetPoint("TOP",0,-23);title:SetText("Forever Armory — Character Export")
        local help=frame:CreateFontString(nil,"OVERLAY","GameFontHighlight");help:SetPoint("TOP",0,-52);help:SetText("Ctrl+C (Cmd+C on Mac), then paste at forever.dudgeon.io")
        local close=CreateFrame("Button",nil,frame,"UIPanelCloseButton");close:SetPoint("TOPRIGHT",-7,-7)
        local scroll=CreateFrame("ScrollFrame",nil,frame,"UIPanelScrollFrameTemplate");scroll:SetPoint("TOPLEFT",24,-85);scroll:SetPoint("BOTTOMRIGHT",-42,24)
        local box=CreateFrame("EditBox",nil,scroll);box:SetMultiLine(true);box:SetFontObject(ChatFontNormal);box:SetWidth(540);box:SetAutoFocus(false)
        box:SetScript("OnEscapePressed",function() frame:Hide() end);scroll:SetScrollChild(box);frame.box=box
        table.insert(UISpecialFrames,"ForeverArmoryExportFrame")
    end
    frame:Show();frame.box:SetText(text);frame.box:SetFocus();frame.box:HighlightText()
end
SLASH_FOREVERARMORY1="/farmory"
SLASH_FOREVERARMORY2="/fa"
SlashCmdList.FOREVERARMORY=showExport
