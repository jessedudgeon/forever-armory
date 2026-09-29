-- Persistent confirmed quest turn-ins and automatic logout/reload snapshots.
-- No HTTP, filesystem APIs, polling, or automatic UI during logout.
ForeverArmorySessions = function(api)
    local safe,plain,array,stamp=api.safe,api.plain,api.array,api.stamp
    local active,questNames,registered=nil,{},{}
    local lastNotice
    local function key()
        return (plain(safe(GetRealmName)) or 'unknown')..':'..(plain(safe(UnitGUID,'player')) or plain(safe(UnitName,'player')) or 'unknown')
    end
    local function journal()
        ForeverArmoryJournal=ForeverArmoryJournal or {characters={}}
        ForeverArmoryJournal.characters=ForeverArmoryJournal.characters or {}
        local k=key()
        local c=ForeverArmoryJournal.characters[k]
        if not c then c={events={},completed={},sequence=0,sessionSequence=0};ForeverArmoryJournal.characters[k]=c end
        return c,k
    end
    local function start()
        if active then return end
        local c,k=journal();c.sessionSequence=c.sessionSequence+1
        active={id='fa:s:1:'..k..':'..c.sessionSequence,startedAt=stamp(),sequence=c.sessionSequence}
    end
    local function rememberNames()
        if C_QuestLog and C_QuestLog.GetNumQuestLogEntries and C_QuestLog.GetInfo then
            local n=plain(safe(C_QuestLog.GetNumQuestLogEntries))
            if type(n)=='number' and n>=0 and n<=500 then
                for i=1,n do local q=safe(C_QuestLog.GetInfo,i)
                    if type(q)=='table' and not q.isHeader then
                        local id,title=plain(q.questID),plain(q.title)
                        if type(id)=='number' and title then questNames[id]=title end
                    end
                end
            end
        end
    end
    local function backfill()
        local c=journal()
        if C_QuestLog and C_QuestLog.GetAllCompletedQuestIDs then
            local ids=safe(C_QuestLog.GetAllCompletedQuestIDs)
            if type(ids)=='table' and #ids<=20000 then
                for _,id in ipairs(ids)do if type(plain(id))=='number' and id>0 then c.completed[id]=true end end
                c.backfilledAt=stamp()
            end
        end
        -- Backfill supplies IDs only; it cannot supply historical completion times.
    end
    local function turnedIn(id,xp,money)
        id=plain(id);if type(id)~='number' or id<=0 or id~=math.floor(id) then return end
        start()
        local now=plain(safe(GetTime))
        -- Ignore repeated delivery in the same client tick, preserving repeatable quests later.
        if now and lastNotice and lastNotice.id==id and lastNotice.tick==now then return end
        lastNotice={id=id,tick=now}
        local c,k=journal();c.sequence=c.sequence+1
        local title=questNames[id] or (C_QuestLog and plain(safe(C_QuestLog.GetTitleForQuestID,id)))
        c.events[#c.events+1]={eventId='fa:q:1:'..k..':'..c.sequence,type='quest-turned-in',questId=id,
            name=title,completedAt=stamp(),characterGuid=plain(safe(UnitGUID,'player')),sessionId=active.id,
            level=plain(safe(UnitLevel,'player')),zone=plain(safe(GetZoneText)),xpReward=plain(xp),moneyReward=plain(money)}
        c.completed[id]=true
    end
    local function augment(out)
        start();backfill()
        local c=journal()
        out.completedQuestIDs=array()
        for id in pairs(c.completed)do out.completedQuestIDs[#out.completedQuestIDs+1]=id end
        table.sort(out.completedQuestIDs)
        out.questHistory=array()
        -- Keep the full journal on disk. Bound each wire export to the latest 2000 events.
        local first=math.max(1,#c.events-1999)
        for i=first,#c.events do out.questHistory[#out.questHistory+1]=c.events[i] end
        out.questHistoryStatus={status=registered.QUEST_TURNED_IN and 'tracking' or 'unavailable',
            totalEvents=#c.events,exportedEvents=#out.questHistory,truncated=first>1,backfilledAt=c.backfilledAt}
        if not registered.QUEST_TURNED_IN then out.warnings[#out.warnings+1]='Quest turn-in event unavailable; completion timing cannot be tracked in this client.' end
        if first>1 then out.warnings[#out.warnings+1]='Export includes the latest 2000 quest events; older events remain in SavedVariables and all known completed IDs are included.' end
        out.session={id=active.id,startedAt=active.startedAt,status='in-progress'}
    end
    local function save()
        start()
        local ok,text,out=pcall(api.capture,'session-end')
        local c=journal()
        if not ok then c.lastExportError=tostring(text);return false end
        if #text>1000000 then c.lastExportError='Session export exceeds the website 1 MB import limit. Previous export retained; quest journal is still saved.';return false end
        -- Both globals are per-character SavedVariables, saved by the client's lifecycle.
        ForeverArmorySessionExport=text
        c.lastSession={name=out.name,observedAt=out.observedAt,bank=out.bank and out.bank.status or 'unavailable',recipes=#(out.recipes or {}),sessionId=active.id}
        c.lastExportError=nil
        return true
    end
    local function last()
        local saved=journal().lastSession
        if not saved or type(ForeverArmorySessionExport)~='string' then return nil end
        local out={json=ForeverArmorySessionExport};for k,v in pairs(saved)do out[k]=v end
        return out
    end
    local function install()
        local f=CreateFrame('Frame')
        for _,e in ipairs({'PLAYER_LOGIN','PLAYER_LOGOUT','QUEST_TURNED_IN','QUEST_LOG_UPDATE'})do
            registered[e]=pcall(f.RegisterEvent,f,e)
        end
        local pending=false
        f:SetScript('OnEvent',function(_,event,a,b,c)
            local ok,err=pcall(function()
                if event=='PLAYER_LOGIN' then
                    start();rememberNames();backfill()
                    local j=journal()
                    if j.lastExportError then print('Forever Armory: last session export failed: '..j.lastExportError)
                    elseif j.lastSession then print('Forever Armory: session saved '..j.lastSession.observedAt..'. /farmory last copies it, or upload your character SavedVariables/ForeverArmory.lua at forever.dudgeon.io.') end
                elseif event=='PLAYER_LOGOUT' then save()
                elseif event=='QUEST_TURNED_IN' then turnedIn(a,b,c)
                elseif event=='QUEST_LOG_UPDATE' and not pending then
                    pending=true
                    local function scan() pending=false;pcall(rememberNames) end
                    if C_Timer and C_Timer.After then C_Timer.After(0.5,scan) else scan() end
                end
            end)
            if not ok then print('Forever Armory: session collector unavailable: '..tostring(err)) end
        end)
    end
    return {augment=augment,install=install,last=last}
end
