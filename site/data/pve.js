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
    "entrance": "Classic reference: inside Blackrock Depths; attunement provides a shortcut.",
    "quests": [
      {
        "id": "attunement-to-the-core",
        "name": "Attunement to the Core",
        "description": "Classic shortcut attunement. Forever quest mapping is pending.",
        "requirements": "Verify the quest and access conditions in the Forever client.",
        "source": "https://www.wowhead.com/classic/quest=7848/attunement-to-the-core"
      }
    ],
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
    "entrance": "Classic reference: Dustwallow Marsh. Exact Forever entrance is not verified.",
    "quests": [
      {
        "id": "victory-for-the-horde",
        "name": "Victory for the Horde",
        "faction": "Horde",
        "description": "Classic reference: deliver the Head of Onyxia to the Warchief.",
        "source": "https://news.blizzard.com/en-us/article/24165121/20th-anniversary-realms-molten-core-and-onyxia-s-lair-now-live"
      }
    ],
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
        ],
        "questIds": [
          "victory-for-the-horde"
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
    "entrance": "Classic reference: at the top of Blackrock Spire, reached from Blackrock Mountain.",
    "quests": [
      {
        "id": "blackhands-command",
        "name": "Blackhand’s Command",
        "description": "Classic access quest; Forever quest mapping is pending.",
        "prerequisites": [
          {
            "id": "scarshield",
            "name": "Defeat the Scarshield Quartermaster near Blackrock Spire and loot the command."
          },
          {
            "id": "accept-command",
            "name": "Use the command to accept the quest.",
            "prerequisiteIds": [
              "scarshield"
            ]
          },
          {
            "id": "orb",
            "name": "Reach the orb behind General Drakkisath in Upper Blackrock Spire.",
            "prerequisiteIds": [
              "accept-command"
            ]
          }
        ],
        "source": "https://news.blizzard.com/en-us/article/23302788/wow-classic-descend-into-the-depths-of-blackwing-lair"
      }
    ],
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
  },
  {
    "kind": "raid",
    "id": "zulgurub",
    "name": "Zul’Gurub",
    "level": "60",
    "zone": "Stranglethorn Vale",
    "faction": "Both",
    "source": "https://news.blizzard.com/en-us/article/23391283/wow-classic-zulgurub-and-more-now-available",
    "description": "Classic reference; Forever availability, access requirements and encounter details remain unverified.",
    "coverage": "partial",
    "entrance": "Classic reference: east of Lake Nazferiti.",
    "quests": [],
    "encounters": [
      {
        "id": "high-priestess-jeklik",
        "name": "High Priestess Jek’lik",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "high-priest-venoxis",
        "name": "High Priest Venoxis",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "high-priestess-marli",
        "name": "High Priestess Mar’li",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "high-priest-thekal",
        "name": "High Priest Thekal",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "high-priestess-arlokk",
        "name": "High Priestess Arlokk",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "bloodlord-mandokir",
        "name": "Bloodlord Mandokir",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "jindo-the-hexer",
        "name": "Jin’do the Hexer",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "gahzranka",
        "name": "Gahz’ranka",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "grilek",
        "name": "Gri’lek",
        "order": 9,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "hazzarah",
        "name": "Hazza’rah",
        "order": 10,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "renataki",
        "name": "Renataki",
        "order": 11,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "wushoolay",
        "name": "Wushoolay",
        "order": 12,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "hakkar",
        "name": "Hakkar",
        "order": 13,
        "description": "",
        "mechanics": [],
        "loot": []
      }
    ],
    "mechanics": [
      "Classic reference: four Edge of Madness bosses rotate; a single reset does not include all four."
    ]
  },
  {
    "kind": "raid",
    "id": "ruins-of-ahnqiraj",
    "name": "Ruins of Ahn’Qiraj",
    "level": "60",
    "zone": "Silithus",
    "faction": "Both",
    "source": "https://news.blizzard.com/en-us/article/23493335/explore-the-temple-of-ahnqiraj-and-ruins-of-ahnqiraj",
    "description": "Classic reference; Forever availability, access requirements and encounter details remain unverified.",
    "coverage": "partial",
    "entrance": "Classic reference: left of the main Ahn’Qiraj gate.",
    "quests": [],
    "encounters": [
      {
        "id": "kurinnaxx",
        "name": "Kurinnaxx",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "general-rajaxx",
        "name": "General Rajaxx",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "moam",
        "name": "Moam",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "buru-the-gorger",
        "name": "Buru the Gorger",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "ayamiss-the-hunter",
        "name": "Ayamiss the Hunter",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "ossirian-the-unscarred",
        "name": "Ossirian the Unscarred",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": []
      }
    ],
    "accessRequirements": [
      "Classic reference: the realm must open the Gates of Ahn’Qiraj. This is not a personal attunement or proof of character completion."
    ]
  },
  {
    "kind": "raid",
    "id": "temple-of-ahnqiraj",
    "name": "Temple of Ahn’Qiraj",
    "level": "60",
    "zone": "Silithus",
    "faction": "Both",
    "source": "https://news.blizzard.com/en-us/article/23493335/explore-the-temple-of-ahnqiraj-and-ruins-of-ahnqiraj",
    "description": "Classic reference; Forever availability, access requirements and encounter details remain unverified.",
    "coverage": "partial",
    "entrance": "Classic reference: right of the main Ahn’Qiraj gate.",
    "quests": [],
    "encounters": [
      {
        "id": "the-prophet-skeram",
        "name": "The Prophet Skeram",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "silithid-royalty",
        "name": "Silithid Royalty",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "battleguard-sartura",
        "name": "Battleguard Sartura",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "fankriss-the-unyielding",
        "name": "Fankriss the Unyielding",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "viscidus",
        "name": "Viscidus",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "princess-huhuran",
        "name": "Princess Huhuran",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "the-twin-emperors",
        "name": "The Twin Emperors",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "ouro",
        "name": "Ouro",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "cthun",
        "name": "C’Thun",
        "order": 9,
        "description": "",
        "mechanics": [],
        "loot": []
      }
    ],
    "accessRequirements": [
      "Classic reference: the realm must open the Gates of Ahn’Qiraj. This is not a personal attunement or proof of character completion."
    ]
  },
  {
    "kind": "raid",
    "id": "naxxramas",
    "name": "Naxxramas",
    "level": "60",
    "zone": "Eastern Plaguelands",
    "faction": "Both",
    "source": "https://news.blizzard.com/en-us/article/23572632/wow-classic-naxxramas-is-now-live",
    "description": "Classic reference; Forever availability, access requirements and encounter details remain unverified.",
    "coverage": "partial",
    "entrance": "Classic reference: use the teleport spire after attunement.",
    "quests": [
      {
        "id": "the-dread-citadel-naxxramas",
        "name": "The Dread Citadel – Naxxramas",
        "description": "Classic attunement reference; Forever quest mapping is pending.",
        "prerequisites": [
          {
            "id": "argent-dawn",
            "name": "Reach Honored with the Argent Dawn."
          },
          {
            "id": "angela",
            "name": "Speak to Archmage Angela Dosantos at Light’s Hope Chapel.",
            "prerequisiteIds": [
              "argent-dawn"
            ]
          },
          {
            "id": "materials",
            "name": "Supply the requested materials; higher reputation reduces the cost.",
            "prerequisiteIds": [
              "angela"
            ]
          }
        ],
        "source": "https://news.blizzard.com/en-us/article/23572632/wow-classic-naxxramas-is-now-live"
      }
    ],
    "encounters": [
      {
        "id": "anubrekhan",
        "name": "Anub’Rekhan",
        "order": 1,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "grand-widow-faerlina",
        "name": "Grand Widow Faerlina",
        "order": 2,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "maexxna",
        "name": "Maexxna",
        "order": 3,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "noth-the-plaguebringer",
        "name": "Noth the Plaguebringer",
        "order": 4,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "heigan-the-unclean",
        "name": "Heigan the Unclean",
        "order": 5,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "loatheb",
        "name": "Loatheb",
        "order": 6,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "instructor-razuvious",
        "name": "Instructor Razuvious",
        "order": 7,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "gothik-the-harvester",
        "name": "Gothik the Harvester",
        "order": 8,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "the-four-horsemen",
        "name": "The Four Horsemen",
        "order": 9,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "patchwerk",
        "name": "Patchwerk",
        "order": 10,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "grobbulus",
        "name": "Grobbulus",
        "order": 11,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "gluth",
        "name": "Gluth",
        "order": 12,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "thaddius",
        "name": "Thaddius",
        "order": 13,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "sapphiron",
        "name": "Sapphiron",
        "order": 14,
        "description": "",
        "mechanics": [],
        "loot": []
      },
      {
        "id": "kelthuzad",
        "name": "Kel’Thuzad",
        "order": 15,
        "description": "",
        "mechanics": [],
        "loot": []
      }
    ]
  }
];
