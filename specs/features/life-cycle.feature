Feature: Life Cycle
  The player lives from age 16 until death, then reincarnates
  through the amulet.

  Scenario: New game starts at age 16
    Given a brand new game with no save data
    When the game starts
    Then the player should be age 16
    And the player should be in "slums"
    And the "find_amulet" story flag should be set

  Scenario: Amulet glows near death
    Given the player is age 58
    When the player reaches the death threshold age
    Then the "amulet_glowing" story flag should be set
    And all normal actions should be disabled
    And the "Touch the Amulet" action should be available

  Scenario: Touching the amulet triggers reincarnation
    Given the "amulet_glowing" story flag is set
    When the player performs "touch_amulet" action
    Then the player should reincarnate
    And prestige bonuses should be applied
    And the player should be age 16

  Scenario: Full life cycle completes
    Given a new game has started
    When the player plays through an entire life
    And the player touches the amulet
    Then the player should be in a new life
    And prestige bonuses from the previous life should be active

  Scenario: Save and load preserves state
    Given the player has been playing for some time
    When the game is saved
    And the game is loaded
    Then all game state should match the saved state
