"""Run guarded collector/command tests with Python lupa (pip install lupa).
Mocks verify branches and serialization, not actual Forever API availability.
"""
import json
from pathlib import Path
from lupa.lua51 import LuaRuntime
source=Path('addon/ForeverArmory/Collectors.lua').read_text()+'\n'+Path('addon/ForeverArmory/ForeverArmory.lua').read_text()
setup=r'''
SlashCmdList={};UISpecialFrames={};UIParent={};ChatFontNormal={}
function print(...) end
function date(...) return '2026-09-29T21:22:36Z' end
Frames={}
function CreateFrame(...)
 local f={};Frames[#Frames+1]=f
 return setmetatable(f,{__index=function(t,k) if k=='CreateFontString' then return function()return CreateFrame()end end
 return function(self,value,handler) if k=='SetScript' then self[value]=handler end; if k=='SetText' and type(value)=='string' and value:sub(1,1)=='{' then CapturedJSON=value end end end})
end
function UnitClass()return 'Paladin','PALADIN'end
function UnitName()return 'Lasmus'end
function UnitRace()return 'Undead'end
function GetRealmName()return 'Classic Beta PvE'end
function UnitFactionGroup()return 'Horde'end
function UnitLevel()return 15 end
function UnitXP()return 5627 end
function UnitXPMax()return 14400 end
function GetMoney()return 3723 end
function GetZoneText()return 'Orgrimmar'end
function GetSubZoneText()return 'Valley'end
function UnitGUID()return 'Player-TEST-1'end
function UnitHealthMax()return 500 end
function UnitStat(_,i)return 10,20+i end
function UnitArmor()return 10,50 end
function UnitPowerMax()return 100 end
function GetInventoryItemID(_,slot)if slot==16 then return 246164 end end
function GetInventoryItemLink()return '[Skullthumper]'end
C_Container={GetContainerNumSlots=function(bag)return bag==0 and 2 or 0 end,
 GetContainerItemInfo=function(bag,slot)return {itemID=2840,hyperlink='[Copper Bar]',stackCount=slot==1 and 20 or 13}end}
C_ClassTalents={GetActiveConfigID=function()return 1 end}
C_Traits={GetConfigInfo=function()return {treeIDs={100}}end,GetTreeNodes=function()return {101}end,
 GetNodeInfo=function()return {ranksPurchased=2,activeEntry={entryID=102}}end,
 GetEntryInfo=function()return {definitionID=104}end,GetDefinitionInfo=function()return {spellID=103}end}
C_Spell={GetSpellName=function()return 'Redoubt'end}
C_QuestLog={GetNumQuestLogEntries=function()return 1 end,GetInfo=function()return {questID=123,title='Test quest',level=14}end,IsComplete=function()return true end}
C_TradeSkillUI={GetAllRecipeIDs=function()return {200}end,GetRecipeInfo=function()return {name='Test craft',learned=true}end,GetProfessionInfoByRecipeID=function()return {professionName='Blacksmithing'}end}
'''
def client(extra=''):
    lua=LuaRuntime();lua.execute(setup);lua.execute(extra);lua.execute(source);return lua
lua=client();lua.globals().SlashCmdList.FOREVERARMORY('recipes');lua.globals().SlashCmdList.FOREVERARMORY('export')
c=json.loads(lua.globals().CapturedJSON)['character']
assert c['gameIdentity']['guid']=='Player-TEST-1'
assert [i['count'] for i in c['inventory']]==[20,13]
assert [i['slot'] for i in c['inventory']]==[1,2]
assert c['talents'][0]['entryID']==102 and c['talents'][0]['spellID']==103
assert c['stats']['strength']==21 and c['quests'][0]['id']==123
assert c['recipes'][0]['profession']=='Blacksmithing'
lua.globals().SlashCmdList.FOREVERARMORY('help')
# Missing APIs never fabricate a GUID or erase prior website storage.
lua=client('UnitGUID=nil;C_Container=nil;GetInventoryItemID=nil;C_ClassTalents=nil;C_Traits=nil;C_QuestLog=nil;C_TradeSkillUI=nil')
lua.globals().SlashCmdList.FOREVERARMORY('');c=json.loads(lua.globals().CapturedJSON)['character']
assert 'gameIdentity' not in c and 'inventory' not in c and 'gear' not in c and 'talents' not in c
assert c['recipesCaptured'] is False and len(c['warnings'])>=5
# Incomplete container calls must not claim empty/complete storage.
lua=client('C_Container.GetContainerNumSlots=function(bag)if bag==1 then error("unavailable")end return 0 end')
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert 'inventory' not in c and not c['storageStatus']['bank']['captured']
print('Addon Lua mock checks passed: slots, GUID, stats, IDs, recipe scan, missing APIs, incomplete bags, commands.')

# Event-driven bank cache retains locations/time after closing; other GUIDs never share it.
lua=client("BANK_CONTAINER=-1;NUM_BANKBAGSLOTS=0;NUM_BAG_SLOTS=4;C_Container.GetContainerNumSlots=function(bag)return bag==-1 and 2 or 0 end")
lua.execute("Frames[1].OnEvent(Frames[1],'BANKFRAME_OPENED')")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert c['bank']['status']=='current' and sum(i['count'] for i in c['inventory'])==33
lua.execute("Frames[1].OnEvent(Frames[1],'BANKFRAME_CLOSED')")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert c['bank']['status']=='cached' and c['bank']['observedAt']=='2026-09-29T21:22:36Z'
lua.execute("UnitGUID=function()return 'Player-TEST-2'end")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert c['bank']['status']=='not-scanned' and len(c['recipes'])==0
# Explicit empty scan is different from never-scanned; failed refresh retains cache.
lua.execute("UnitGUID=function()return 'Player-TEST-1'end;C_Container.GetContainerNumSlots=function()return 0 end;Frames[1].OnEvent(Frames[1],'BANKFRAME_OPENED')")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert c['bank']['status']=='current' and len(c['inventory'])==0
lua.execute("C_Container.GetContainerNumSlots=function()error('blocked')end")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert c['bank']['status']=='cached'
# Emit a real collector-generated mock payload for the website compatibility test.
if __name__=='__main__':
    import sys
    if len(sys.argv)>1:
        lua=client();lua.globals().SlashCmdList.FOREVERARMORY('recipes');lua.globals().SlashCmdList.FOREVERARMORY('export');Path(sys.argv[1]).write_text(lua.globals().CapturedJSON)
print('Bank open/close/empty/error and multi-character cache isolation checks passed.')
# SavedVariables lose metatables across reload; cached arrays must still encode as JSON arrays.
lua=client("BANK_CONTAINER=-1;NUM_BANKBAGSLOTS=0;NUM_BAG_SLOTS=4;C_Container.GetContainerNumSlots=function(bag)return bag==-1 and 2 or 0 end;GetItemInfo=function()return 'Copper Bar','|Hitem:2840:1:2:0:0:0|h[Copper Bar]|h',1,5 end")
lua.globals().SlashCmdList.FOREVERARMORY('recipes')
lua.execute("Frames[1].OnEvent(Frames[1],'BANKFRAME_OPENED');Frames[1].OnEvent(Frames[1],'BANKFRAME_CLOSED');function plainCopy(v)if type(v)~='table'then return v end local copy={};for k,x in pairs(v)do copy[k]=plainCopy(x)end return copy end;ForeverArmoryCache=plainCopy(ForeverArmoryCache)")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert isinstance(c['inventory'][0]['gems'],list) and isinstance(c['recipes'][0]['reagents'],list)
assert c['inventory'][0]['enchantments']==['1'] and c['inventory'][0]['gemEnchantIDs']==[2]
assert c['recipeScans'][0]['observedAt']=='2026-09-29T21:22:36Z'
assert json.loads(lua.globals().CapturedJSON)['addonVersion']=='0.2.0'
print('SavedVariables reload serialization, recipe scan timestamps and version metadata checks passed.')
lua=client("C_Container.GetContainerItemInfo=function(bag,slot)if slot==1 then return {itemID=2840,hyperlink='[Copper Bar]',stackCount=20}end return nil end")
lua.globals().SlashCmdList.FOREVERARMORY('export');c=json.loads(lua.globals().CapturedJSON)['character']
assert len(c['inventory'])==1 and c['storageStatus']['backpack']['captured'] is True
print('Modern empty slots remain valid captured inventory.')
