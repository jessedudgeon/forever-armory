// Curated assertions; see docs/CONTENT-VERIFICATION.md. Unverified records stay out of public projections.
export const PVE_INSTANCES = [
  {
    "kind": "dungeon",
    "id": "hall-of-thanes",
    "name": "The Hall of Thanes",
    "level": "13–18",
    "zone": "Beneath Ironforge",
    "faction": "Both",
    "new": true,
    "coverage": "Boss roster and sourced loot; drop tables may be incomplete",
    "entrance": "Follow the passage from the High Seat into Old Ironforge.",
    "quests": [
      {
        "id": "old-ironforge-incursion",
        "name": "Old Ironforge Incursion",
        "gameQuestId": 96393,
        "source": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
          "sourceType": "forever-database",
          "verifiedAt": "2026-10-02",
          "notes": "Forever quest record supplies identity, objective and reward choices. The series order is corroborated by both quest pages."
        },
        "description": "Defeat Durgen Dirgehammer.",
        "faction": "Alliance",
        "rewardItemIds": [
          279895,
          279896,
          279894
        ],
        "prerequisites": [
          {
            "id": "underground-map",
            "name": "Underground Map",
            "gameQuestId": 96391,
            "source": "https://www.wowhead.com/forever/quest=96391/underground-map",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/quest=96391/underground-map",
              "sourceType": "forever-database",
              "verifiedAt": "2026-10-02",
              "notes": "Forever quest record supplies identity, objective and reward choices. The series order is corroborated by both quest pages."
            }
          }
        ]
      },
      {
        "id": "important-heirlooms",
        "name": "Important Heirlooms",
        "description": "Recover heirlooms.",
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Both",
        "rewardItemIds": [
          279898
        ]
      },
      {
        "id": "an-ancient-grudge",
        "name": "An Ancient Grudge",
        "description": "Defeat Faldrim Anvilmar.",
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Both",
        "rewardItemIds": [
          279899
        ]
      },
      {
        "id": "the-restless-dead",
        "name": "The Restless Dead",
        "description": "Defeat apparitions and tormented souls.",
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Alliance"
      },
      {
        "id": "the-treaty-of-understanding",
        "name": "The Treaty of Understanding",
        "description": "Begins from a vault in the Reliquary of Kings.",
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Alliance"
      }
    ],
    "encounters": [
      {
        "id": "faldrim-anvilmar",
        "name": "Faldrim Anvilmar",
        "order": 1,
        "description": "",
        "mechanics": [
          "Clear a safe space before pulling the patrolling boss."
        ],
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271097,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 270227,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271096,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "questIds": [
          "an-ancient-grudge"
        ],
        "area": "Anvilmar's Rest"
      },
      {
        "id": "magmatus",
        "name": "Magmatus",
        "order": 2,
        "description": "",
        "mechanics": [
          "Defeat the accompanying summoner first."
        ],
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 270230,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 270231,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271095,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "plunder",
        "name": "Plunder",
        "order": 3,
        "description": "",
        "mechanics": [
          "Position against a wall to manage knockback."
        ],
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 270228,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271098,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 270229,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "durgen-dirgehammer",
        "name": "Durgen Dirgehammer",
        "order": 4,
        "description": "",
        "mechanics": [
          "Clear surrounding enemies before engaging; fear can draw extra enemies."
        ],
        "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 270256,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 270260,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 270261,
            "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "questIds": [
          "old-ironforge-incursion"
        ]
      }
    ],
    "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
    "checkedAt": "2026-10-02",
    "availability": "Reported in Forever guides",
    "evidence": {
      "status": "observed",
      "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
      "sourceType": "forever-guide",
      "verifiedAt": "2026-10-02",
      "notes": "Forever-specific guide report; not independent in-client verification."
    },
    "fieldEvidence": {},
    "loot": [
      {
        "itemId": 279895,
        "sourceType": "quest-reward",
        "questId": "old-ironforge-incursion",
        "sourceName": "Old Ironforge Incursion",
        "sourceUrl": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
          "sourceType": "forever-database",
          "verifiedAt": "2026-10-02",
          "notes": "Forever quest record supplies identity, objective and reward choices. The series order is corroborated by both quest pages."
        },
        "requirements": "Choose one reward from this Alliance quest."
      },
      {
        "itemId": 279896,
        "sourceType": "quest-reward",
        "questId": "old-ironforge-incursion",
        "sourceName": "Old Ironforge Incursion",
        "sourceUrl": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
          "sourceType": "forever-database",
          "verifiedAt": "2026-10-02",
          "notes": "Forever quest record supplies identity, objective and reward choices. The series order is corroborated by both quest pages."
        },
        "requirements": "Choose one reward from this Alliance quest."
      },
      {
        "itemId": 279898,
        "sourceType": "quest-reward",
        "questId": "important-heirlooms",
        "sourceName": "Important Heirlooms",
        "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "requirements": "Quest reward; choices and eligibility depend on the quest."
      },
      {
        "itemId": 279899,
        "sourceType": "quest-reward",
        "questId": "an-ancient-grudge",
        "sourceName": "An Ancient Grudge",
        "sourceUrl": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/hall-of-thanes-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "requirements": "Quest reward; choices and eligibility depend on the quest."
      },
      {
        "itemId": 279894,
        "sourceType": "quest-reward",
        "questId": "old-ironforge-incursion",
        "sourceName": "Old Ironforge Incursion",
        "sourceUrl": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/quest=96393/old-ironforge-incursion",
          "sourceType": "forever-database",
          "verifiedAt": "2026-10-02",
          "notes": "Forever quest record supplies identity, objective and reward choices. The series order is corroborated by both quest pages."
        },
        "requirements": "Choose one reward from this Alliance quest."
      }
    ]
  },
  {
    "kind": "dungeon",
    "id": "ruins-of-lordaeron",
    "name": "Ruins of Lordaeron",
    "level": "16–22",
    "zone": "Lordaeron",
    "faction": "Both",
    "new": true,
    "coverage": "Boss roster and sourced loot; drop tables may be incomplete",
    "entrance": "Portal in the ruins above Undercity, approached from Tirisfal Glades.",
    "quests": [
      {
        "id": "the-new-plague",
        "name": "The New Plague",
        "description": "Obtain the toxic strain from Witherfang.",
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        }
      },
      {
        "id": "wrath-of-rathmael",
        "name": "The Wrath of Rath’mael",
        "description": "Defeat Rath’mael.",
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        }
      },
      {
        "id": "abominable-creatures",
        "name": "Abominable Creatures",
        "description": "Bring the Baron’s head to Captain Truman.",
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        }
      },
      {
        "id": "a-frightened-request",
        "name": "A Frightened Request",
        "description": "Find Edward Heartweaver near Rath’mael.",
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        }
      }
    ],
    "encounters": [
      {
        "id": "witherfang",
        "name": "Witherfang",
        "order": 1,
        "description": "",
        "mechanics": [
          "Defeat the spiders and cleanse the tank’s poison."
        ],
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271201,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271203,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271202,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "area": "King’s Alley",
        "questIds": [
          "the-new-plague"
        ]
      },
      {
        "id": "the-baron",
        "name": "The Baron",
        "order": 2,
        "description": "",
        "mechanics": [
          "Prepare for a damaging attack that reduces threat."
        ],
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271204,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271205,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271206,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "area": "",
        "questIds": [
          "abominable-creatures"
        ]
      },
      {
        "id": "viktor-the-vile",
        "name": "Viktor the Vile",
        "order": 3,
        "description": "",
        "mechanics": [
          "Activate the fireplace and survive five waves."
        ],
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271218,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271212,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271211,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "area": "Lordamere Overlook",
        "questIds": []
      },
      {
        "id": "the-abandoned",
        "name": "The Abandoned",
        "order": 4,
        "description": "",
        "mechanics": [
          "The statue event summons three waves before the boss."
        ],
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271216,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271208,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271207,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "area": "Market Street",
        "questIds": []
      },
      {
        "id": "bjork",
        "name": "Bjork",
        "order": 5,
        "description": "",
        "mechanics": [
          "Expect a brief anti-magic shield."
        ],
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271217,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271209,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271210,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "area": "",
        "questIds": []
      },
      {
        "id": "rath-mael",
        "name": "Rath'Mael",
        "order": 6,
        "description": "",
        "mechanics": [
          "Move away from the Flamestrike target area."
        ],
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 271213,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271215,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 271214,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "area": "",
        "questIds": [
          "wrath-of-rathmael",
          "a-frightened-request"
        ]
      }
    ],
    "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
    "checkedAt": "2026-10-02",
    "availability": "Reported in Forever guides",
    "evidence": {
      "status": "observed",
      "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
      "sourceType": "forever-guide",
      "verifiedAt": "2026-10-02",
      "notes": "Forever-specific guide report; not independent in-client verification."
    },
    "fieldEvidence": {
      "level": {
        "status": "observed",
        "source": "https://www.wowhead.com/forever/guide/ruins-of-lordaeron-dungeon-overview-location-rewards",
        "sourceType": "forever-guide",
        "verifiedAt": "2026-10-02",
        "notes": "Detailed guide recommends 16–22; older overview says 15–20. No minimum entry level implied."
      }
    }
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
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "confirmed",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Announced above Whelgar’s Excavation."
      }
    }
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
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "confirmed",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "City identity established in announcement."
      }
    }
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
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      }
    }
  },
  {
    "kind": "dungeon",
    "id": "kroldok-stronghold",
    "name": "Krol’dok Stronghold",
    "level": "40–45",
    "zone": "Riverglades",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      }
    }
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
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      }
    }
  },
  {
    "kind": "dungeon",
    "id": "blackmaw-hold",
    "name": "Blackmaw Hold",
    "level": "55–60",
    "zone": "Northern Azshara",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      }
    }
  },
  {
    "kind": "dungeon",
    "id": "shapers-terrace",
    "name": "Shaper’s Terrace",
    "level": "58–60",
    "zone": "Un’Goro Crater",
    "faction": "Both",
    "new": true,
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [],
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      }
    }
  },
  {
    "kind": "dungeon",
    "id": "ragefire-chasm",
    "name": "Ragefire Chasm",
    "level": "13–18",
    "zone": "Orgrimmar",
    "faction": "Horde",
    "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
    "coverage": "Boss roster and sourced loot; drop tables may be incomplete",
    "entrance": "Instance portal inside Orgrimmar’s Cleft of Shadow.",
    "quests": [
      {
        "id": "slaying-the-beast",
        "name": "Slaying the Beast",
        "description": "Seek Neeru Fireblade in Orgrimmar.",
        "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Horde"
      },
      {
        "id": "hidden-enemies",
        "name": "Hidden Enemies",
        "description": "Dungeon stage of Thrall’s quest chain.",
        "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Horde",
        "requirements": "Complete the preceding three steps from Thrall first; exact Forever quest IDs await verification."
      }
    ],
    "encounters": [
      {
        "id": "oggleflint",
        "name": "Oggleflint",
        "order": 1,
        "description": "",
        "mechanics": [
          "Control the extra troggs; face cleave away from allies."
        ],
        "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
        "loot": [],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "taragaman-the-hungerer",
        "name": "Taragaman the Hungerer",
        "order": 2,
        "description": "",
        "mechanics": [
          "Stay away from lava edges during knockback."
        ],
        "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 14148,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 14149,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 14145,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "questIds": [
          "slaying-the-beast"
        ]
      },
      {
        "id": "jergosh-the-invoker",
        "name": "Jergosh the Invoker",
        "order": 3,
        "description": "",
        "mechanics": [
          "Control one add and defeat the other before the boss."
        ],
        "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 14147,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 14150,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 14151,
            "sourceUrl": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "bazzalan",
        "name": "Bazzalan",
        "order": 4,
        "description": "",
        "mechanics": [
          "Separate or control the accompanying enemies."
        ],
        "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
        "loot": [],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      }
    ],
    "checkedAt": "2026-10-02",
    "availability": "Reported in Forever guides",
    "evidence": {
      "status": "observed",
      "source": "https://www.wowhead.com/forever/guide/ragefire-chasm-dungeon-overview-location-rewards",
      "sourceType": "forever-guide",
      "verifiedAt": "2026-10-02",
      "notes": "Forever-specific guide report; not independent in-client verification."
    },
    "fieldEvidence": {}
  },
  {
    "kind": "dungeon",
    "id": "wailing-caverns",
    "name": "Wailing Caverns",
    "level": "15–25",
    "zone": "The Barrens",
    "faction": "Both",
    "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
    "coverage": "Boss roster and sourced loot; drop tables may be incomplete",
    "entrance": "Caves at Lushwater Oasis, southwest of the Crossroads.",
    "quests": [
      {
        "id": "smart-drinks",
        "name": "Smart Drinks",
        "description": "Collect essence for Mebok Mizzyrix in Ratchet.",
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Both",
        "prerequisites": [
          {
            "id": "raptor-horns",
            "name": "Raptor Horns",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ]
      },
      {
        "id": "leaders-of-the-fang",
        "name": "Leaders of the Fang",
        "description": "Collect the four druid bosses’ gems.",
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Horde",
        "requirements": "Complete the preceding chain starting with The Forgotten Pools; full step mapping awaits verification."
      },
      {
        "id": "the-glowing-shard",
        "name": "The Glowing Shard",
        "description": "Begins with the shard from Mutanus.",
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Both"
      }
    ],
    "encounters": [
      {
        "id": "kresh",
        "name": "Kresh",
        "order": 1,
        "description": "",
        "mechanics": [
          "Expect heavy armor and melee damage."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 13245,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6447,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "lady-anacondra",
        "name": "Lady Anacondra",
        "order": 2,
        "description": "",
        "mechanics": [
          "Interrupt sleep."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 10412,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 5404,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "lord-cobrahn",
        "name": "Lord Cobrahn",
        "order": 3,
        "description": "",
        "mechanics": [
          "Defeat pythons and interrupt sleep."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6465,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6460,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 10410,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "deviate-faerie-dragon-rare",
        "name": "Deviate Faerie Dragon",
        "order": 4,
        "description": "",
        "mechanics": [
          "Control accompanying druids."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 5243,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6632,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "lord-pythas",
        "name": "Lord Pythas",
        "order": 5,
        "description": "",
        "mechanics": [
          "Control the druid and interrupt sleep."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6472,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6473,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "skum",
        "name": "Skum",
        "order": 6,
        "description": "",
        "mechanics": [
          "Spread around the boss."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6449,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6448,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "notes": [
          "Optional encounter."
        ]
      },
      {
        "id": "lord-serpentis",
        "name": "Lord Serpentis",
        "order": 7,
        "description": "",
        "mechanics": [
          "Interrupt sleep."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 10411,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6459,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 5970,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6469,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "verdan-the-everliving",
        "name": "Verdan the Everliving",
        "order": 8,
        "description": "",
        "mechanics": [
          "Ranged players should avoid the nearby root."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6629,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6631,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6630,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "mutanus-the-devourer",
        "name": "Mutanus the Devourer",
        "order": 9,
        "description": "",
        "mechanics": [
          "Protect the disciple during the event."
        ],
        "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6627,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6463,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6461,
            "sourceUrl": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "questIds": [
          "the-glowing-shard"
        ],
        "prerequisites": [
          "Defeat the four Lords of the Fang to unlock the Naralex event."
        ]
      }
    ],
    "checkedAt": "2026-10-02",
    "availability": "Reported in Forever guides",
    "evidence": {
      "status": "observed",
      "source": "https://www.wowhead.com/forever/guide/wailing-caverns-dungeon-overview-location-rewards",
      "sourceType": "forever-guide",
      "verifiedAt": "2026-10-02",
      "notes": "Forever-specific guide report; not independent in-client verification."
    },
    "fieldEvidence": {}
  },
  {
    "kind": "dungeon",
    "id": "deadmines",
    "name": "The Deadmines",
    "level": "18–23",
    "zone": "Westfall",
    "faction": "Both",
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "coverage": "partial",
    "entrance": "",
    "quests": [],
    "encounters": [],
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
  },
  {
    "kind": "dungeon",
    "id": "shadowfang-keep",
    "name": "Shadowfang Keep",
    "level": "22–30",
    "zone": "Silverpine Forest",
    "faction": "Both",
    "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
    "coverage": "Boss roster and sourced loot; drop tables may be incomplete",
    "entrance": "The keep entrance north of Pyrewood Village in Silverpine Forest.",
    "quests": [
      {
        "id": "arugal-must-die",
        "name": "Arugal Must Die",
        "description": "Bring Arugal’s head to Dalar Dawnweaver.",
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Horde"
      },
      {
        "id": "the-book-of-ur",
        "name": "The Book of Ur",
        "description": "Recover the book from Fenrus’s room.",
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Horde"
      },
      {
        "id": "deathstalkers-in-shadowfang",
        "name": "Deathstalkers in Shadowfang",
        "description": "Speak with Deathstalker Vincent.",
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "faction": "Horde"
      }
    ],
    "encounters": [
      {
        "id": "rethilgore",
        "name": "Rethilgore",
        "order": 1,
        "description": "",
        "mechanics": [
          "Clear nearby enemies before engaging."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 5254,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "fel-steeds-shadow-charger",
        "name": "Fel Steeds / Shadow Charger",
        "order": 2,
        "description": "",
        "mechanics": [
          "Control the horses and focus them individually."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 932,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "group"
      },
      {
        "id": "razorclaw-the-butcher",
        "name": "Razorclaw the Butcher",
        "order": 3,
        "description": "",
        "mechanics": [
          "Clear the room and patrols first."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6226,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6633,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 1292,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "baron-silverlaine",
        "name": "Baron Silverlaine",
        "order": 4,
        "description": "",
        "mechanics": [
          "Prepare for reduced healing on the tank."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6323,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6321,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "commander-springvale",
        "name": "Commander Springvale",
        "order": 5,
        "description": "",
        "mechanics": [
          "Interrupt healing and isolate the silencing guard."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 3191,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6320,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "odo-the-blindwatcher",
        "name": "Odo the Blindwatcher",
        "order": 6,
        "description": "",
        "mechanics": [
          "Defeat the bats before focusing the boss."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6319,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6318,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "deathsworn-captain-rare",
        "name": "Deathsworn Captain",
        "order": 7,
        "description": "",
        "mechanics": [
          "Face cleave away from allies."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6641,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6642,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "rare"
      },
      {
        "id": "fenrus-the-devourer",
        "name": "Fenrus the Devourer",
        "order": 8,
        "description": "",
        "mechanics": [
          "Watch the damage-over-time effect."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6340,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 3230,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "wolf-master-nandos",
        "name": "Wolf Master Nandos",
        "order": 9,
        "description": "",
        "mechanics": [
          "Defeat summoned worgs promptly."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 3748,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6314,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss"
      },
      {
        "id": "archmage-arugal",
        "name": "Archmage Arugal",
        "order": 10,
        "description": "",
        "mechanics": [
          "Avoid losing healer line of sight while chasing teleports."
        ],
        "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "loot": [
          {
            "itemId": 6324,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6392,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          },
          {
            "itemId": 6220,
            "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
            "evidence": {
              "status": "observed",
              "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
              "sourceType": "forever-guide",
              "verifiedAt": "2026-10-02",
              "notes": "Forever-specific guide report; not independent in-client verification."
            }
          }
        ],
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        },
        "orderEvidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Guide listing order; not a mandatory kill sequence."
        },
        "encounterType": "boss",
        "questIds": [
          "arugal-must-die"
        ]
      }
    ],
    "checkedAt": "2026-10-02",
    "availability": "Reported in Forever guides",
    "evidence": {
      "status": "observed",
      "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
      "sourceType": "forever-guide",
      "verifiedAt": "2026-10-02",
      "notes": "Forever-specific guide report; not independent in-client verification."
    },
    "fieldEvidence": {},
    "loot": [
      {
        "itemId": 1482,
        "sourceType": "trash",
        "sourceName": "Instance enemies",
        "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        }
      },
      {
        "itemId": 1935,
        "sourceType": "trash",
        "sourceName": "Instance enemies",
        "sourceUrl": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
        "evidence": {
          "status": "observed",
          "source": "https://www.wowhead.com/forever/guide/shadowfang-keep-dungeon-overview-location-rewards",
          "sourceType": "forever-guide",
          "verifiedAt": "2026-10-02",
          "notes": "Forever-specific guide report; not independent in-client verification."
        }
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
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
    "encounters": [],
    "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
    "checkedAt": "2026-10-02",
    "availability": "Awaiting Forever verification",
    "evidence": {
      "status": "likely-inherited",
      "source": "https://www.wowhead.com/forever/guide/dungeons-overview-locations-details",
      "sourceType": "mixed-reference",
      "verifiedAt": "2026-10-02",
      "notes": "Overview explicitly includes Classic/database fallback for unavailable dungeons. Needs direct Forever evidence."
    },
    "fieldEvidence": {}
  },
  {
    "id": "hyjal-summit",
    "name": "Hyjal Summit",
    "kind": "raid",
    "level": "60",
    "zone": "Mount Hyjal",
    "faction": "Both",
    "new": true,
    "playerSize": 20,
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "coverage": "Announcement only; boss and loot details not confirmed",
    "entrance": "",
    "quests": [],
    "encounters": [],
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      },
      "zone": {
        "status": "confirmed",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Hyjal location established in announcement."
      }
    }
  },
  {
    "id": "barrow-deeps",
    "name": "Barrow Deeps",
    "kind": "raid",
    "level": "60",
    "zone": "Not documented",
    "faction": "Both",
    "new": true,
    "playerSize": 10,
    "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
    "checkedAt": "2026-10-02",
    "availability": "Announced for Forever",
    "coverage": "Announcement only; boss and loot details not confirmed",
    "entrance": "",
    "quests": [],
    "encounters": [],
    "evidence": {
      "status": "confirmed",
      "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
      "sourceType": "official-announcement",
      "verifiedAt": "2026-10-02",
      "notes": "Confirms announcement only, not current access or unspecified details."
    },
    "fieldEvidence": {
      "level": {
        "status": "confirmed",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Maximum-level challenge in the announced 1–60 game."
      },
      "zone": {
        "status": "unknown",
        "source": "https://news.blizzard.com/en-us/article/24303862/world-of-warcraft-forever-whats-next-panel-recap",
        "sourceType": "official-announcement",
        "verifiedAt": "2026-10-02",
        "notes": "Not established by the announcement."
      }
    }
  }
];
