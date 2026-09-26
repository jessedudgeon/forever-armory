-- Forever Armory: user-initiated, read-only character export. No SavedVariables or network.
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
    if C_Container and C_Container.GetContainerNumSlots then return safe(C_Container.GetContainerNumSlots, bag) or 0 end
    return safe(GetContainerNumSlots, bag) or 0
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
local function readInventory(out)
    if not ((C_Container and C_Container.GetContainerNumSlots) or GetContainerNumSlots) then
        out.warnings[#out.warnings + 1] = "Bag inventory APIs unavailable in this client."
        return
    end
    local aggregated = {}
    for bag = 0, 4 do
        for slot = 1, containerSlots(bag) do
            local item = containerEntry(bag, slot)
            if item and item.id then
                if aggregated[item.id] then
                    aggregated[item.id].count = aggregated[item.id].count + (item.count or 1)
                    if not aggregated[item.id].icon then aggregated[item.id].icon = item.icon end
                    if not aggregated[item.id].link then aggregated[item.id].link = item.link end
                else aggregated[item.id] = item end
            end
        end
    end
    local ids = {}
    for id in pairs(aggregated) do ids[#ids + 1] = id end
    table.sort(ids)
    for _, id in ipairs(ids) do out.inventory[#out.inventory + 1] = aggregated[id] end
end
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
SlashCmdList.FOREVERARMORY=showExport
