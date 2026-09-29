-- Optional, event-driven collectors. No server calls; all APIs are capability checked.
ForeverArmoryCollectors = function(api)
    local safe,plain,array,stamp=api.safe,api.plain,api.array,api.stamp
    local bankOpen=false
    local pending=false
    local function count(fn,limit,...)
        local n=plain(safe(fn,...))
        if type(n)~='number' or n<0 or n>limit then return nil end
        return math.floor(n)
    end
    local function cache()
        ForeverArmoryCache=ForeverArmoryCache or {characters={}}
        ForeverArmoryCache.characters=ForeverArmoryCache.characters or {}
        local guid=plain(safe(UnitGUID,'player'))
        local realm=plain(safe(GetRealmName)) or 'unknown'
        local name=plain(safe(UnitName,'player')) or 'unknown'
        local key=realm..':'..(guid or name)
        local c=ForeverArmoryCache.characters[key]
        if not c then
            c={recipes={},recipeScans={}};ForeverArmoryCache.characters[key]=c
            -- Legacy cache is already per-character SavedVariables; migrate it once only.
            if not ForeverArmoryRecipeMigrationDone then
                c.recipes=ForeverArmoryRecipes or {};ForeverArmoryRecipeMigrationDone=true
            end
        end
        c.recipes=c.recipes or {};c.recipeScans=c.recipeScans or {}
        return c
    end
    local function scanBank()
        if not bankOpen or safe(InCombatLockdown) then return false end
        local main=plain(BANK_CONTAINER) or (Enum and Enum.BagIndex and plain(Enum.BagIndex.Bank))
        local n=plain(NUM_BANKBAGSLOTS)
        local bagCount=plain(NUM_TOTAL_EQUIPPED_BAG_SLOTS) or plain(NUM_BAG_SLOTS)
        -- Never guess bank indices on a different storage implementation.
        if type(main)~='number' or type(n)~='number' or type(bagCount)~='number' or n>20 then
            cache().bankError='Bank API layout unavailable; no empty-bank claim made.';return false
        end
        local ids={main};for i=1,n do ids[#ids+1]=bagCount+i end
        local items,containers={},{}
        for _,bag in ipairs(ids) do
            local slots=plain(api.containerSlots(bag))
            if type(slots)~='number' or slots<0 or slots>500 then cache().bankError='Bank scan incomplete; previous cache retained.';return false end
            containers[#containers+1]=api.containerInfo(bag,slots)
            for slot=1,slots do
                local item,failed=api.containerEntry(bag,slot)
                if failed then cache().bankError='Bank item read failed; previous cache retained.';return false end
                if item then item.bag=bag;item.container=tostring(bag);item.slot=slot;item.location='bank';items[#items+1]=item end
            end
        end
        cache().bank={items=items,containers=containers,observedAt=stamp()};cache().bankError=nil
        return true
    end
    local function bank(out)
        local c=cache()
        if bankOpen then scanBank();c=cache() end
        out.storageStatus=out.storageStatus or {}
        if c.bank then
            out.inventory=out.inventory or array()
            for _,item in ipairs(c.bank.items) do
                local row={};for k,v in pairs(item)do row[k]=v end
                for _,key in ipairs({'gems','enchantments','gemEnchantIDs'})do
                    if row[key] then local list=array();for _,value in ipairs(row[key])do list[#list+1]=value end;row[key]=list end
                end
                row.observedAt=c.bank.observedAt;out.inventory[#out.inventory+1]=row
            end
            out.storageStatus.bank={captured=true,status=bankOpen and not c.bankError and 'current' or 'cached',observedAt=c.bank.observedAt}
            out.bank={status=out.storageStatus.bank.status,observedAt=c.bank.observedAt,containers=array()}
            for _,v in ipairs(c.bank.containers or {})do out.bank.containers[#out.bank.containers+1]=v end
        else
            out.storageStatus.bank={captured=false,status=bankOpen and 'unavailable' or 'not-scanned'}
            out.bank={status=out.storageStatus.bank.status}
        end
        if c.bankError then out.warnings[#out.warnings+1]=c.bankError end
        if not c.bank then out.warnings[#out.warnings+1]='Bank not scanned. Open your bank before exporting; unsupported storage stays unknown.' end
    end
    local function progression(out)
        local c=cache()
        out.sex=plain(safe(UnitSex,'player'))
        out.bindLocation=plain(safe(GetBindLocation))
        if c.played then out.playedTime={total=c.played.total,level=c.played.level,observedAt=c.played.observedAt} end
        -- UnitName's second return is the realm, NOT a surname. Do not fabricate one.
        if not out.name:find("%s") then out.firstName=out.name end
        out.displayName=out.name
        local repCount=count(GetNumFactions,1000)
        if repCount and GetFactionInfo then
            out.reputations=array()
            for i=1,repCount do
                local name,_,standing,lo,hi,value,_,_,header,_,hasRep,_,_,id=safe(GetFactionInfo,i)
                if plain(name) and (not header or hasRep) then out.reputations[#out.reputations+1]={id=plain(id),name=plain(name),standing=plain(standing),min=plain(lo),max=plain(hi),value=plain(value)} end
            end
        elseif C_Reputation and C_Reputation.GetNumFactions and C_Reputation.GetFactionDataByIndex then
            local total=count(C_Reputation.GetNumFactions,1000)
            if total then
                out.reputations=array()
                for i=1,total do local r=safe(C_Reputation.GetFactionDataByIndex,i)
                    if r and plain(r.name) and (not r.isHeader or r.isHeaderWithRep) then out.reputations[#out.reputations+1]={id=plain(r.factionID),name=plain(r.name),standing=plain(r.reaction),min=plain(r.currentReactionThreshold),max=plain(r.nextReactionThreshold),value=plain(r.currentStanding)} end
                end
            end
        end
        if not out.reputations then out.warnings[#out.warnings+1]='Reputation APIs unavailable.' end
        local skills=count(GetNumSkillLines,1000)
        if skills and GetSkillLineInfo then
            out.skills=array()
            for i=1,skills do
                local name,header,_,rank,_,_,max=safe(GetSkillLineInfo,i)
                if not header and plain(name) then out.skills[#out.skills+1]={name=plain(name),rank=plain(rank),max=plain(max)} end
            end
        end
        if C_QuestLog and C_QuestLog.GetAllCompletedQuestIDs then
            local ids=safe(C_QuestLog.GetAllCompletedQuestIDs)
            if type(ids)=='table' and #ids<=20000 then
                out.completedQuestIDs=array();for _,id in ipairs(ids)do if type(plain(id))=='number' then out.completedQuestIDs[#out.completedQuestIDs+1]=id end end
            end
        end
        -- Legacy spell book only, bounded; modern spell-book signatures vary by client.
        local tabs=count(GetNumSpellTabs,20)
        if tabs and GetSpellTabInfo and GetSpellBookItemInfo then
            out.spells=array();local seen={}
            for tab=1,tabs do
                local _,_,offset,n=safe(GetSpellTabInfo,tab)
                if type(plain(offset))=='number' and type(plain(n))=='number' and n<=1000 then
                    for i=offset+1,offset+n do
                        local kind,id=safe(GetSpellBookItemInfo,i,BOOKTYPE_SPELL or 'spell')
                        id=plain(id)
                        if kind=='SPELL' and type(id)=='number' and not seen[id] then seen[id]=true;out.spells[#out.spells+1]=id end
                    end
                end
            end
        end
        out.recipeScans=array();for profession,at in pairs(c.recipeScans)do out.recipeScans[#out.recipeScans+1]={profession=profession,observedAt=at,status='cached'} end
        table.sort(out.recipeScans,function(a,b)return a.profession<b.profession end)
    end
    local function install(scanRecipes)
        if not CreateFrame then return end
        local f=CreateFrame('Frame')
        for _,event in ipairs({'BANKFRAME_OPENED','BANKFRAME_CLOSED','BAG_UPDATE_DELAYED','PLAYERBANKSLOTS_CHANGED','TRADE_SKILL_SHOW','TRADE_SKILL_LIST_UPDATE','PLAYER_REGEN_ENABLED','TIME_PLAYED_MSG'})do safe(f.RegisterEvent,f,event) end
        local recipesPending=false
        local function flush()
            pending=false
            if safe(InCombatLockdown) then return end
            if bankOpen then pcall(scanBank) end
            if recipesPending then recipesPending=false;pcall(scanRecipes,true) end
        end
        f:SetScript('OnEvent',function(_,event,a,b)
            if event=='BANKFRAME_CLOSED' then bankOpen=false;return end
            if event=='TIME_PLAYED_MSG' then
                if type(plain(a))=='number' and type(plain(b))=='number' then cache().played={total=a,level=b,observedAt=stamp()} end
                return
            end
            if event=='BANKFRAME_OPENED' then bankOpen=true end
            if event=='TRADE_SKILL_SHOW' or event=='TRADE_SKILL_LIST_UPDATE' then recipesPending=true end
            if not bankOpen and not recipesPending then return end
            if pending then return end
            pending=true
            if C_Timer and C_Timer.After then C_Timer.After(0.5,flush) else flush() end
        end)
    end
    return {cache=cache,bank=bank,progression=progression,install=install,scanBank=scanBank}
end
