Feature: Reincarnation System
  Upon reincarnation, accumulated skill and job levels provide
  permanent XP bonuses in future lives.

  Scenario: Skill levels convert to reincarnation bonus
    Given the player has reached "strength" level 15 in this life
    And the player had 10 total "strength" levels from past lives
    When the player reincarnates
    Then the permanent "strength" XP bonus should be 25%

  Scenario: Job levels convert to reincarnation bonus
    Given the player has reached "beggar" job level 20 in this life
    And the player had 0 total "beggar" levels from past lives
    When the player reincarnates
    Then the permanent "beggar" XP bonus should be 20%

  Scenario: Reincarnation bonuses stack across lives
    Given the player had 30 total "concentration" levels from past lives
    And the player reached "concentration" level 12 in this life
    When the player reincarnates
    Then the permanent "concentration" XP bonus should be 42%

  Scenario: All progress resets except reincarnation bonuses on reincarnation
    Given the player has skills and jobs at various levels
    And the player has 500 money
    When the player reincarnates
    Then all skill levels should be 0
    And all job levels should be 0
    And money should be 0
    And the player should be in "slums"
    And the player should be age 16

  Scenario: Lives lived counter increments
    Given the player has lived 3 previous lives
    When the player reincarnates
    Then the lives lived count should be 4

  Scenario: Reincarnation bonus applies to future XP gain
    Given the player has 20% reincarnation bonus for "strength"
    And the player is training "strength" with base XP of 1
    When 1 game tick passes
    Then the effective XP gained should be 1.2
