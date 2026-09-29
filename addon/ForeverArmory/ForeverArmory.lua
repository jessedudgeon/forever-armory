-- Forever Armory: user-initiated read-only export. Recipe cache is per character; no network.
local VERSION="0.2.0"
local function safe(fn, ...)
    if type(fn) ~= "function" then return nil end
    -- Preserve older APIs' long tuples (item info, faction info, skill lines).
    local values={pcall(fn,...)}
    if values[1] then return (unpack or table.unpack)(values,2,16) end
end
local function plain(v)
    if issecretvalue and issecretvalue(v) then return nil end
    if type(v) == "string" then return v end
    if type(v)=="number" and v==v and v~=math.huge and v~=-math.huge then return v end
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
    local itemLevel
    local getInfo=GetItemInfo or (C_Item and C_Item.GetItemInfo)
    if id and getInfo then
        local loadedName, loadedLink, loadedQuality, loadedLevel, _, _, _, _, _, loadedIcon = safe(getInfo, id)
        itemLevel=plain(loadedLevel)
        name = plain(loadedName) or name
        link = plain(loadedLink) or link
        quality = plain(loadedQuality) or quality
        icon = plain(loadedIcon) or icon
    end
    local row={id=id,name=name or (id and ("Item " .. id) or "Unknown item"),link=link,quality=quality,icon=icon,count=count or 1,itemLevel=itemLevel}
    if type(link)=='string' then
        local encoded=link:match('item:([%d:%-]+)')
        if encoded then
            local fields={};for part in (encoded..':'):gmatch('(.-):')do fields[#fields+1]=part end
            row.enchantID=tonumber(fields[2]);row.enchantments=array();row.gems=array()
            if row.enchantID and row.enchantID>0 then row.enchantments[1]=tostring(row.enchantID) end
            -- Link gem fields are enchant IDs in some clients: retain them explicitly, never relabel as item IDs.
            row.gemEnchantIDs=array();for i=3,6 do local v=tonumber(fields[i]);if v and v>0 then row.gemEnchantIDs[#row.gemEnchantIDs+1]=v end end
        end
    end
    if GetItemGem and link then
        row.gems=array()
        for i=1,4 do local _,gemLink=safe(GetItemGem,link,i);local gem=idFromLink(plain(gemLink));if gem then row.gems[#row.gems+1]=gem end end
    end
    return row
end
local function containerSlots(bag)
    if C_Container and C_Container.GetContainerNumSlots then return safe(C_Container.GetContainerNumSlots, bag) end
    return safe(GetContainerNumSlots, bag)
end
local function containerEntry(bag, slot)
    if C_Container and C_Container.GetContainerItemInfo then
        local ok,info = pcall(C_Container.GetContainerItemInfo, bag, slot)
        if not ok then return nil,true end
        if info==nil then return nil end -- A readable empty slot is not an unavailable API.
        if type(info) == "table" then
            local link = plain(info.hyperlink) or (C_Container.GetContainerItemLink and plain(safe(C_Container.GetContainerItemLink, bag, slot)))
            local id = plain(info.itemID) or idFromLink(link)
            if id then local item=itemInfo(id,link,plain(info.quality),plain(info.iconFileID),plain(info.stackCount) or 1)
                if not (issecretvalue and issecretvalue(info.isBound)) and type(info.isBound)=='boolean' then item.binding=info.isBound and 'bound' or 'unbound' end
                return item
            end
            return nil, info.itemID~=nil or info.hyperlink~=nil
        end
    end
    if not GetContainerItemInfo and not GetContainerItemLink and not GetContainerItemID then return nil,true end
    local texture, count, _, quality = safe(GetContainerItemInfo, bag, slot)
    local link = plain(safe(GetContainerItemLink, bag, slot))
    local id = idFromLink(link)
    if not id and GetContainerItemID then id = plain(safe(GetContainerItemID, bag, slot)) end
    return id and itemInfo(id, link, plain(quality), plain(texture), plain(count) or 1) or nil
end
local function containerInfo(bag,slots)
    local index=plain(safe((C_Container and C_Container.ContainerIDToInventoryID) or ContainerIDToInventoryID,bag))
    return {bag=bag,size=slots,name=plain(safe(GetBagName or (C_Container and C_Container.GetBagName),bag)),link=index and plain(safe(GetInventoryItemLink,'player',index))}
end
local function readInventory(out)
    if not ((C_Container and C_Container.GetContainerNumSlots) or GetContainerNumSlots) then
        out.inventory=nil
        out.warnings[#out.warnings + 1] = "Bag inventory APIs unavailable in this client."
        return
    end
    out.storageStatus = {backpack={captured=true,status="current"},bags={captured=true,status="current"}}
    out.containers=array()
    local maxBag=plain(NUM_TOTAL_EQUIPPED_BAG_SLOTS) or plain(NUM_BAG_SLOTS) or 4
    for bag = 0, math.min(maxBag,20) do
        local slots=plain(containerSlots(bag))
        if type(slots)~="number" then
            out.inventory=nil;out.storageStatus=nil
            out.warnings[#out.warnings+1]="Bag scan incomplete; previous storage will be retained."
            return
        end
        out.containers[#out.containers+1]=containerInfo(bag,slots)
        for slot = 1, slots do
            local item,failed = containerEntry(bag, slot)
            if failed then out.inventory=nil;out.storageStatus=nil;out.warnings[#out.warnings+1]="Bag item read failed; previous storage retained.";return end
            if item and item.id then
                item.bag=bag; item.container=tostring(bag); item.slot=slot
                item.location=bag==0 and "backpack" or "bags"
                out.inventory[#out.inventory+1]=item
            end
        end
    end
end
local collectors=ForeverArmoryCollectors({safe=safe,plain=plain,array=array,containerSlots=containerSlots,containerEntry=containerEntry,containerInfo=containerInfo,stamp=function()return date("!%Y-%m-%dT%H:%M:%SZ")end})
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
                        out.talents[#out.talents + 1] = {name=plain(name) or ("Talent node " .. nodeID), rank=rank,treeID=plain(treeID),nodeID=plain(nodeID),entryID=active and plain(active.entryID),spellID=plain(spell),maxRank=plain(node.maxRanks)}
                    end
                end
            end
            return true
        end
    end
    if GetNumTalentTabs and GetNumTalents and GetTalentInfo then
        for tab = 1, (safe(GetNumTalentTabs) or 0) do
            for i = 1, (safe(GetNumTalents, tab) or 0) do
                local name, _, tier, column, rank, maxRank = safe(GetTalentInfo, tab, i)
                rank = plain(rank)
                if rank and rank > 0 then out.talents[#out.talents + 1] = {name=plain(name) or "Talent",rank=rank,treeIndex=tab,talentIndex=i,tier=plain(tier),column=plain(column),maxRank=plain(maxRank)} end
            end
        end
        return true
    end
    return false
end
-- Only capture APIs available to this client; absent/secret values stay absent.
local function readExtended(out)
    local guid=plain(safe(UnitGUID,"player"))
    if guid then out.gameIdentity={guid=guid,realm=out.realm}
    else out.warnings[#out.warnings+1]="Character GUID unavailable; website will use account/name matching." end
    out.stats={health=plain(safe(UnitHealthMax,"player")),mana=plain(safe(UnitPowerMax,"player",0))}
    local keys={"strength","agility","stamina","intellect","spirit"}
    for i,key in ipairs(keys) do local _,effective=safe(UnitStat,"player",i);out.stats[key]=plain(effective) end
    local _,armor=safe(UnitArmor,"player");out.stats.armor=plain(armor)
    if not next(out.stats) then out.stats=nil end
    out.location={zone=out.zone,subZone=plain(safe(GetSubZoneText)),mapID=C_Map and plain(safe(C_Map.GetBestMapForUnit,"player"))}
    if C_QuestLog and C_QuestLog.GetInfo and C_QuestLog.GetNumQuestLogEntries then
        out.quests=array()
        for i=1,(safe(C_QuestLog.GetNumQuestLogEntries) or 0) do
            local q=safe(C_QuestLog.GetInfo,i)
            if q and not q.isHeader and plain(q.questID) then
                local done=safe(C_QuestLog.IsComplete,q.questID)
                local row={id=plain(q.questID),title=plain(q.title),level=plain(q.level),completed=done==true,objectives=array()}
                for _,objective in ipairs(safe(C_QuestLog.GetQuestObjectives,q.questID) or {})do row.objectives[#row.objectives+1]={text=plain(objective.text),type=plain(objective.type),fulfilled=plain(objective.numFulfilled),required=plain(objective.numRequired),completed=objective.finished==true} end
                out.quests[#out.quests+1]=row
            end
        end
    else out.warnings[#out.warnings+1]="Quest log API unavailable; earlier website observations are retained." end
    out.recipes=array()
    for _,recipe in pairs(collectors.cache().recipes) do
        local row={};for k,v in pairs(recipe)do row[k]=v end
        row.reagents=array();for _,r in ipairs(recipe.reagents or {})do row.reagents[#row.reagents+1]=r end
        out.recipes[#out.recipes+1]=row
    end
    table.sort(out.recipes,function(a,b)return a.id<b.id end)
    if #out.recipes==0 then out.recipesCaptured=false;out.warnings[#out.warnings+1]="No recipes scanned yet; open each profession and run /farmory recipes." end

end
local function scanRecipes(quiet)
    local cache=collectors.cache()
    local count=0
    -- Scans add known recipes only. A partial/filtered window never erases a cache.
    if C_TradeSkillUI and C_TradeSkillUI.GetAllRecipeIDs and C_TradeSkillUI.GetRecipeInfo and C_TradeSkillUI.GetProfessionInfoByRecipeID then
        for _,id in ipairs(safe(C_TradeSkillUI.GetAllRecipeIDs) or {}) do
            local info=safe(C_TradeSkillUI.GetRecipeInfo,id)
            local prof=safe(C_TradeSkillUI.GetProfessionInfoByRecipeID,id)
            if info and info.learned and plain(info.name) and prof and plain(prof.professionName) then
                local link=plain(safe(C_TradeSkillUI.GetRecipeItemLink,id))
                local row={id=tostring(id),spellID=id,name=plain(info.name),profession=plain(prof.professionName),known=true,craftedItem=idFromLink(link),reagents=array()}
                cache.professionSkills=cache.professionSkills or {}
                cache.professionSkills[row.profession]={name=row.profession,rank=plain(prof.skillLevel),max=plain(prof.maxSkillLevel),observedAt=date("!%Y-%m-%dT%H:%M:%SZ") }
                cache.recipes[row.profession..":"..row.id]=row;cache.recipeScans[row.profession]=date("!%Y-%m-%dT%H:%M:%SZ");count=count+1
            end
        end
    elseif GetNumTradeSkills and GetTradeSkillInfo and GetTradeSkillRecipeLink then
        local profession=plain(safe(GetTradeSkillLine))
        if profession then for i=1,(safe(GetNumTradeSkills) or 0) do
            local name,kind=safe(GetTradeSkillInfo,i)
            local recipeLink=plain(safe(GetTradeSkillRecipeLink,i))
            local id=recipeLink and (recipeLink:match("enchant:(%d+)") or recipeLink:match("spell:(%d+)"))
            if name and kind~="header" and id then
                local row={id=id,name=plain(name),profession=profession,known=true,craftedItem=idFromLink(plain(safe(GetTradeSkillItemLink,i))),reagents=array()}
                for j=1,(safe(GetTradeSkillNumReagents,i) or 0) do
                    local _,_,quantity=safe(GetTradeSkillReagentInfo,i,j)
                    local reagent=idFromLink(plain(safe(GetTradeSkillReagentItemLink,i,j)))
                    if reagent and plain(quantity) then row.reagents[#row.reagents+1]={id=reagent,quantity=quantity} end
                end
                cache.recipes[profession..":"..id]=row;cache.recipeScans[profession]=date("!%Y-%m-%dT%H:%M:%SZ");count=count+1
            end
        end end
    end
    if not quiet then print("Forever Armory: scanned "..count.." known recipes. Open each profession, scan again, then /farmory export. Zero means no readable recipes; cached recipes are retained.") end
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
        out.gear=nil
        out.warnings[#out.warnings + 1] = "Equipment APIs unavailable in this client."
    else
        for slot=1,19 do
            local id = plain(safe(GetInventoryItemID, "player", slot))
            if id then
                local link = plain(safe(GetInventoryItemLink, "player", slot))
                local quality = plain(safe(GetInventoryItemQuality, "player", slot))
                local icon = plain(safe(GetInventoryItemTexture, "player", slot))
                local quantity=plain(safe(GetInventoryItemCount,"player",slot))
                local item = itemInfo(id, link, quality, icon, quantity and quantity>0 and quantity or 1)
                local durability,maximum=safe(GetInventoryItemDurability,slot)
                if plain(durability) and plain(maximum) then item.durability={current=durability,max=maximum} end
                item.slot = slot
                out.gear[#out.gear+1] = item
                if not link and C_Item and C_Item.RequestLoadItemDataByID then safe(C_Item.RequestLoadItemDataByID,id) end
            end
        end
    end
    local inventoryOK=pcall(readInventory,out)
    if not inventoryOK then out.inventory=nil;out.storageStatus=nil;out.warnings[#out.warnings+1]="Bag scan failed; previous storage retained." end
    if not pcall(readExtended,out) then out.warnings[#out.warnings+1]="An optional identity/stat/quest/recipe API failed; remaining data exported." end
    for _,section in ipairs({"bank","progression"})do local ok=pcall(collectors[section],out);if not ok then out.warnings[#out.warnings+1]=section.." collector unavailable; remaining data exported." end end
    if GetProfessions and GetProfessionInfo then
        local a,b,c,d,e,f = safe(GetProfessions)
        for position, index in ipairs({a or 0,b or 0,c or 0,d or 0,e or 0,f or 0}) do
            if index > 0 then
                local name, _, rank, max = safe(GetProfessionInfo,index)
                if plain(name) then out.professions[#out.professions+1]={name=plain(name),rank=plain(rank),max=plain(max),category=position<=2 and "primary" or "secondary"} end
            end
        end
    else out.professions=nil;out.warnings[#out.warnings+1]="Profession APIs unavailable in this client." end
    local cache=collectors.cache()
    if out.professions and #out.professions>0 then cache.professions={rows=out.professions,observedAt=out.observedAt};out.professionStatus={status='current',observedAt=out.observedAt}
    elseif cache.professionSkills and next(cache.professionSkills) then out.professions=array();for _,p in pairs(cache.professionSkills)do out.professions[#out.professions+1]=p end;out.professionStatus={status='cached'}
    elseif cache.professions then out.professions=array();for _,p in ipairs(cache.professions.rows)do out.professions[#out.professions+1]=p end;out.professionStatus={status='cached',observedAt=cache.professions.observedAt}
    else out.professionStatus={status='unavailable'} end
    local ok, supported = pcall(readTalents,out)
    if not ok or not supported then out.talents=nil;out.warnings[#out.warnings+1]="Talent data could not be fully read in this client." end
    if out.money == nil then out.warnings[#out.warnings+1]="Gold could not be captured." end
    if out.xp == nil then out.warnings[#out.warnings+1]="XP could not be captured." end
    if out.talents then
    out.talentSummary={totalPoints=0,trees=array()}
    local totals={};for _,t in ipairs(out.talents or {})do local key=t.treeID or t.treeIndex or 'unknown';totals[key]=(totals[key] or 0)+t.rank;out.talentSummary.totalPoints=out.talentSummary.totalPoints+t.rank end
    for key,points in pairs(totals)do out.talentSummary.trees[#out.talentSummary.trees+1]={tree=key,points=points} end
    table.sort(out.talentSummary.trees,function(a,b)return tostring(a.tree)<tostring(b.tree)end)
    end
    out.metadata={addonVersion=VERSION,schemaVersion=1,exportedAt=out.observedAt}
    return json({format="forever-armory",version=1,schemaVersion=1,addonVersion=VERSION,character=out}),out
end
local frame
local function showExport()
    if InCombatLockdown and InCombatLockdown() then print("Forever Armory: export after leaving combat.") return end
    local ok, text, observation = pcall(capture)
    if not ok then print("Forever Armory: " .. tostring(text)) return end
    if not frame then
        frame=CreateFrame("Frame","ForeverArmoryExportFrame",UIParent,"BackdropTemplate")
        frame:SetSize(620,420);frame:SetPoint("CENTER");frame:SetFrameStrata("DIALOG")
        frame:SetBackdrop({bgFile="Interface\\DialogFrame\\UI-DialogBox-Background",edgeFile="Interface\\DialogFrame\\UI-DialogBox-Border",tile=true,tileSize=32,edgeSize=32,insets={left=10,right=10,top=10,bottom=10}})
        frame:EnableMouse(true);frame:SetMovable(true);frame:RegisterForDrag("LeftButton")
        frame:SetScript("OnDragStart",frame.StartMoving);frame:SetScript("OnDragStop",frame.StopMovingOrSizing)
        local title=frame:CreateFontString(nil,"OVERLAY","GameFontNormalLarge");title:SetPoint("TOP",0,-23);title:SetText("Forever Armory "..VERSION.." — Character Export")
        local help=frame:CreateFontString(nil,"OVERLAY","GameFontHighlight");help:SetPoint("TOP",0,-52);help:SetText("Ctrl+C (Cmd+C on Mac), then paste at forever.dudgeon.io");frame.help=help
        local close=CreateFrame("Button",nil,frame,"UIPanelCloseButton");close:SetPoint("TOPRIGHT",-7,-7)
        local scroll=CreateFrame("ScrollFrame",nil,frame,"UIPanelScrollFrameTemplate");scroll:SetPoint("TOPLEFT",24,-85);scroll:SetPoint("BOTTOMRIGHT",-42,24)
        local box=CreateFrame("EditBox",nil,scroll);box:SetMultiLine(true);box:SetFontObject(ChatFontNormal);box:SetWidth(540);box:SetAutoFocus(false)
        box:SetScript("OnEscapePressed",function() frame:Hide() end);scroll:SetScrollChild(box);frame.box=box
        table.insert(UISpecialFrames,"ForeverArmoryExportFrame")
    end
    frame.help:SetText(observation.name.." · Bank: "..(observation.bank and observation.bank.status or "unavailable").." · Recipes: "..#(observation.recipes or {}).." cached\n"..observation.observedAt.." · Copy to forever.dudgeon.io")
    frame:Show();frame.box:SetText(text);frame.box:SetFocus();frame.box:HighlightText()
    print("Forever Armory: snapshot captured "..date("!%Y-%m-%d %H:%M UTC")..". Copy the selected JSON to Import & backups; review capture warnings there.")
end
SLASH_FOREVERARMORY1="/farmory"
SlashCmdList.FOREVERARMORY=function(message)
    local command=(message or ""):lower():match("^%s*(%S*)")
    if command=="recipes" then
        if InCombatLockdown and InCombatLockdown() then print("Forever Armory: scan recipes after combat.") return end
        local ok,err=pcall(scanRecipes);if not ok then print("Forever Armory: recipe scan unavailable: "..tostring(err)) end
    elseif command=="bank" then print(collectors.scanBank() and "Forever Armory: bank scanned." or "Forever Armory: open the bank out of combat; this client must expose a supported bank layout.")
    elseif command=="" or command=="export" then showExport()
    else print("Forever Armory: /farmory or /farmory export opens a snapshot to copy. /farmory recipes scans the open profession. Scan every profession, then export. Open the bank to cache it; /farmory bank retries while open. Bank/reputation may be unavailable; review warnings. /farmory help shows this help.") end
end

collectors.install(scanRecipes)
