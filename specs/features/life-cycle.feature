Feature: Life Cycle
  The player lives from age 16 until death, then reincarnates
  through the amulet.

  # Summary: Start age 16 in slums. Die ~age 58. Amulet glows near death.
  # Touch amulet → reincarnate with bonuses. Save/load preserves state.

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
    And the player should be in "death_gate"
    And all normal actions should be disabled
    And the "Touch the Amulet" action should be available

  Scenario: Touching the amulet triggers reincarnation
    Given the "amulet_glowing" story flag is set
    When the player performs "touch_amulet" action
    Then the player should reincarnate
    And reincarnation bonuses should be applied
    And the player should be age 16

  Scenario: Full life cycle completes
    Given a new game has started
    When the player plays through an entire life
    And the player touches the amulet
    Then the player should be in a new life
    And reincarnation bonuses from the previous life should be active

  Scenario: Save and load preserves state
    Given the player has been playing for some time
    When the game is saved
    And the game is loaded
    Then all game state should match the saved state

  Scenario: Prison release moves player to slums
    Given the player is in "prison"
    And the player has a pending relocation to "slums" at day 365
    And the player has active continuous actions
    When 365 game ticks pass
    Then the player should be in "slums"
    And the game should pause
    And a release message should appear in the message log

  Scenario: Prisoners steal meals on prison day 30
    Given the player is in "prison"
    And the player has "prison_food" as current food
    And the player entered prison on day 0
    When 30 game ticks pass
    Then the player's current food should be null
    And a meal-stealing message should appear in the message log

  Scenario: Bandit proposal appears on prison day 100
    Given the player is in "prison"
    And the player has active continuous actions
    And the player entered prison on day 0
    When 100 game ticks pass
    Then the game should pause
    And the player's active job action should be cleared
    And the player's active skill action should be cleared
    And a bandit leader message should appear in the message log
    And the "bandit_proposal_active" story flag should be set

  Scenario: Amulet awakens at age 30
    Given the player is alive and age 30
    And the "amulet_awakening" story flag is NOT set
    When 1 game tick passes reaching age 30
    Then the "amulet_awakening" story flag should be set
    And a message about the amulet beginning to glow should appear in the message log
    And the game should continue running (non-blocking event)

  Scenario: Intro story replays after reincarnation
    Given the player has reincarnated
    Then story flags should be empty
    And the "Take the Amulet" action should be available
    And the intro story sequence should proceed as in the first life
