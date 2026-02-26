Feature: Reincarnation System
  Upon reincarnation, accumulated skill and job levels provide
  permanent XP bonuses in future lives.

  # Summary: Lifetime skill/job levels → permanent % XP bonus (1% per level).
  # Bonuses stack across lives. All progress resets except bonuses. Lives counter increments.

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
    And all story flags should be reset
    And the intro story sequence should be available again

  Scenario: Lives lived counter increments
    Given the player has lived 3 previous lives
    When the player reincarnates
    Then the lives lived count should be 4

  Scenario: Reincarnation bonus applies to future XP gain
    Given the player has 20% reincarnation bonus for "strength"
    And the player is training "strength" with base XP of 1
    When 1 game tick passes
    Then the effective XP gained should be 1.2

  Scenario: Player can voluntarily reincarnate after amulet awakening
    Given the player is age 30 or older
    And the "amulet_awakening" story flag is set
    When the player performs "touch_amulet_voluntary" action
    And confirms the reincarnation dialog
    Then the player should reincarnate
    And reincarnation bonuses should be applied
    And the player should be age 16

  Scenario: Reincarnation confirmation dialog shows bonus preview
    Given the player has reached "strength" level 10 in this life
    And the player had 5 total "strength" levels from past lives
    When the player opens the voluntary reincarnation dialog
    Then the dialog should show "Strength: +5% → +15% XP"
    And the dialog should have "Touch the Amulet" and "Step Away" buttons
