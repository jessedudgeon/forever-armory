// Shared dungeon and raid catalog; item definitions live in items.js.
export const PVE_INSTANCES = [
  {
    "kind": "dungeon",
    "id": "hall-of-thanes",
    "name": "The Hall of Thanes",
    "level": "13–18",
    "zone": "Beneath Ironforge",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "ruins-of-lordaeron",
    "name": "Ruins of Lordaeron",
    "level": "15–20",
    "zone": "Lordaeron",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "excavation-site-wetlands",
    "name": "Excavation Site: Wetlands",
    "level": "24–29",
    "zone": "Wetlands",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "city-of-dalaran",
    "name": "City of Dalaran",
    "level": "28–33",
    "zone": "Dalaran",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "drowned-city",
    "name": "The Drowned City",
    "level": "35–40",
    "zone": "Stranglethorn coast",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "kroldok-stronghold",
    "name": "Krol’dok Stronghold",
    "level": "40–45",
    "zone": "Location pending",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "alcaz-prison",
    "name": "Alcaz Prison",
    "level": "48–53",
    "zone": "Alcaz Island",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "blackmaw-hold",
    "name": "Blackmaw Hold",
    "level": "55–60",
    "zone": "Location pending",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "shapers-terrace",
    "name": "Shaper’s Terrace",
    "level": "58–60",
    "zone": "Location pending",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "ragefire-chasm",
    "name": "Ragefire Chasm",
    "level": "13–18",
    "zone": "Orgrimmar",
    "faction": "Horde",
    "source": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "oggleflint",
        "name": "Oggleflint",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "taragaman-the-hungerer",
        "name": "Taragaman the Hungerer",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 14148,
            "sourceUrl": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 14149,
            "sourceUrl": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 14145,
            "sourceUrl": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "jergosh-the-invoker",
        "name": "Jergosh the Invoker",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 14147,
            "sourceUrl": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 14150,
            "sourceUrl": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 14151,
            "sourceUrl": "https://www.wowhead.com/classic/guide/ragefire-chasm-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "bazzalan",
        "name": "Bazzalan",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      }
    ]
  },
  {
    "kind": "dungeon",
    "id": "wailing-caverns",
    "name": "Wailing Caverns",
    "level": "15–25",
    "zone": "The Barrens",
    "faction": "Both",
    "source": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "kresh",
        "name": "Kresh",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 13245,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6447,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "lady-anacondra",
        "name": "Lady Anacondra",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 10412,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5404,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "lord-cobrahn",
        "name": "Lord Cobrahn",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6465,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6460,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 10410,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "deviate-faerie-dragon-rare",
        "name": "Deviate Faerie Dragon (rare)",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5243,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6632,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "lord-pythas",
        "name": "Lord Pythas",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6472,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6473,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "skum",
        "name": "Skum",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6449,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6448,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "lord-serpentis",
        "name": "Lord Serpentis",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 10411,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6459,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5970,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6469,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "verdan-the-everliving",
        "name": "Verdan the Everliving",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6629,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6631,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6630,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "mutanus-the-devourer",
        "name": "Mutanus the Devourer",
        "order": 9,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6627,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6463,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6461,
            "sourceUrl": "https://www.wowhead.com/classic/guide/wailing-caverns-dungeon-strategy-wow-classic"
          }
        ]
      }
    ]
  },
  {
    "kind": "dungeon",
    "id": "deadmines",
    "name": "The Deadmines",
    "level": "18–23",
    "zone": "Westfall",
    "faction": "Both",
    "source": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "rhahkzor",
        "name": "Rhahk’Zor",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5187,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 872,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "miner-johnson-rare",
        "name": "Miner Johnson (rare)",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5443,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5444,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "sneed",
        "name": "Sneed",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5194,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5195,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 2169,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 1937,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "gilnid",
        "name": "Gilnid",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5199,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 1156,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "mr-smite",
        "name": "Mr. Smite",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 7230,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5196,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5192,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "captain-greenskin",
        "name": "Captain Greenskin",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5201,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5200,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 10403,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "edwin-vancleef",
        "name": "Edwin VanCleef",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5193,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5202,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5191,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 10399,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "cookie",
        "name": "Cookie",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5198,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 5197,
            "sourceUrl": "https://www.wowhead.com/classic/guide/deadmines-dungeon-strategy-wow-classic"
          }
        ]
      }
    ]
  },
  {
    "kind": "dungeon",
    "id": "shadowfang-keep",
    "name": "Shadowfang Keep",
    "level": "22–30",
    "zone": "Silverpine Forest",
    "faction": "Both",
    "source": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "rethilgore",
        "name": "Rethilgore",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 5254,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "fel-steeds-shadow-charger",
        "name": "Fel Steeds / Shadow Charger",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 932,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "razorclaw-the-butcher",
        "name": "Razorclaw the Butcher",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6226,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6633,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 1292,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "baron-silverlaine",
        "name": "Baron Silverlaine",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6323,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6321,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "commander-springvale",
        "name": "Commander Springvale",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 3191,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6320,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "odo-the-blindwatcher",
        "name": "Odo the Blindwatcher",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6319,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6318,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "deathsworn-captain-rare",
        "name": "Deathsworn Captain (rare)",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6641,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6642,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "fenrus-the-devourer",
        "name": "Fenrus the Devourer",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6340,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 3230,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "wolf-master-nandos",
        "name": "Wolf Master Nandos",
        "order": 9,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 3748,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6314,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      },
      {
        "id": "archmage-arugal",
        "name": "Archmage Arugal",
        "order": 10,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 6324,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6392,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          },
          {
            "itemId": 6220,
            "sourceUrl": "https://www.wowhead.com/classic/guide/shadowfang-keep-dungeon-strategy-wow-classic"
          }
        ]
      }
    ]
  },
  {
    "kind": "dungeon",
    "id": "blackfathom-deeps",
    "name": "Blackfathom Deeps",
    "level": "24–32",
    "zone": "Ashenvale",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "stockade",
    "name": "The Stockade",
    "level": "24–32",
    "zone": "Stormwind",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "gnomeregan",
    "name": "Gnomeregan",
    "level": "29–38",
    "zone": "Dun Morogh",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "razorfen-kraul",
    "name": "Razorfen Kraul",
    "level": "29–38",
    "zone": "The Barrens",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "scarlet-monastery",
    "name": "Scarlet Monastery",
    "level": "30–46",
    "zone": "Tirisfal Glades",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "razorfen-downs",
    "name": "Razorfen Downs",
    "level": "37–46",
    "zone": "The Barrens",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "uldaman",
    "name": "Uldaman",
    "level": "41–51",
    "zone": "Badlands",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "zulfarrak",
    "name": "Zul’Farrak",
    "level": "44–54",
    "zone": "Tanaris",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "maraudon",
    "name": "Maraudon",
    "level": "46–55",
    "zone": "Desolace",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "sunken-temple",
    "name": "Sunken Temple",
    "level": "50–60",
    "zone": "Swamp of Sorrows",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "blackrock-depths",
    "name": "Blackrock Depths",
    "level": "52–60",
    "zone": "Blackrock Mountain",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "dire-maul",
    "name": "Dire Maul",
    "level": "54–60",
    "zone": "Feralas",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "blackrock-spire",
    "name": "Blackrock Spire",
    "level": "55–60",
    "zone": "Blackrock Mountain",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "scholomance",
    "name": "Scholomance",
    "level": "58–60",
    "zone": "Western Plaguelands",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "dungeon",
    "id": "stratholme",
    "name": "Stratholme",
    "level": "58–60",
    "zone": "Eastern Plaguelands",
    "faction": "Both",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": []
  },
  {
    "kind": "raid",
    "id": "molten-core",
    "name": "Molten Core",
    "level": "60",
    "zone": "Blackrock Mountain",
    "faction": "Both",
    "source": "https://www.wowhead.com/classic/guide/molten-core-raid-overview-wow-classic",
    "description": "Classic encounter reference. Forever mechanics and loot remain unverified.",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "lucifron",
        "name": "Lucifron",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "magmadar",
        "name": "Magmadar",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "gehennas",
        "name": "Gehennas",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "garr",
        "name": "Garr",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "baron-geddon",
        "name": "Baron Geddon",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "shazzrah",
        "name": "Shazzrah",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "sulfuron-harbinger",
        "name": "Sulfuron Harbinger",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "golemagg-the-incinerator",
        "name": "Golemagg the Incinerator",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "majordomo-executus",
        "name": "Majordomo Executus",
        "order": 9,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "ragnaros",
        "name": "Ragnaros",
        "order": 10,
        "description": "",
        "mechanics": [],
        "loot": []
      }
    ]
  },
  {
    "kind": "raid",
    "id": "onyxias-lair",
    "name": "Onyxia’s Lair",
    "level": "60",
    "zone": "Dustwallow Marsh",
    "faction": "Both",
    "source": "https://news.blizzard.com/en-us/article/24165121/20th-anniversary-realms-molten-core-and-onyxia-s-lair-now-live",
    "description": "A Classic dragon encounter. Forever mechanics and loot remain unverified.",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "onyxia",
        "name": "Onyxia",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 17068,
            "sourceUrl": "https://www.wowhead.com/classic/item=17068"
          },
          {
            "itemId": 17075,
            "sourceUrl": "https://www.wowhead.com/classic/item=17075"
          }
        ]
      }
    ]
  },
  {
    "kind": "raid",
    "id": "blackwing-lair",
    "name": "Blackwing Lair",
    "level": "60",
    "zone": "Blackrock Spire",
    "faction": "Both",
    "source": "https://news.blizzard.com/en-us/article/23302788/wow-classic-descend-into-the-depths-of-blackwing-lair",
    "description": "Classic encounter reference. Forever mechanics and loot remain unverified.",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [
      {
        "id": "razorgore-the-untamed",
        "name": "Razorgore the Untamed",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "vaelastrasz-the-corrupt",
        "name": "Vaelastrasz the Corrupt",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "broodlord-lashlayer",
        "name": "Broodlord Lashlayer",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "firemaw",
        "name": "Firemaw",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "ebonroc",
        "name": "Ebonroc",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "flamegor",
        "name": "Flamegor",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "chromaggus",
        "name": "Chromaggus",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "nefarian",
        "name": "Nefarian",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": [
          {
            "itemId": 19364,
            "sourceUrl": "https://www.wowhead.com/classic/item=19364"
          }
        ]
      }
    ]
  }
];
