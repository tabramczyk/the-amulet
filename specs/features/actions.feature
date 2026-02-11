Feature: Actions System
  Players interact through click actions (story/travel) and
  continuous actions (progression). Players can run one job action
  and one skill action simultaneously.

  Background:
    Given a new game has started

  Scenario: Continuous action provides tick effects
    Given the player starts the "begging" continuous action
    When 1 game tick passes
    Then the tick effects of "begging" should be applied

  Scenario: Two continuous actions run simultaneously
    Given the player starts the "begging" continuous action
    And the player starts the "train_concentration" continuous action
    When 1 game tick passes
    Then the tick effects of "begging" should be applied
    And the tick effects of "train_concentration" should be applied

  Scenario: Only one job action at a time
    Given the player is in "fields"
    And the player is performing "begging" job action
    When the player starts "farming" continuous action
    Then "begging" should stop
    And "farming" should be the active job action
    And the active skill action should be unchanged

  Scenario: Only one skill action at a time
    Given the player is performing "train_concentration" skill action
    When the player starts "train_endurance_slums" continuous action
    Then "train_concentration" should stop
    And "train_endurance_slums" should be the active skill action
    And the active job action should be unchanged

  Scenario: Switching job action preserves skill action
    Given the player is in "fields"
    And the player is performing "begging" job action
    And the player is performing "train_concentration" skill action
    When the player starts "farming" continuous action
    Then "farming" should be the active job action
    And "train_concentration" should still be the active skill action

  Scenario: Active actions persist across location change
    Given the player is performing "begging" job action
    And the player is performing "train_concentration" skill action
    When the player changes location
    Then "begging" should still be the active job action
    And "train_concentration" should still be the active skill action

  Scenario: Click action applies effects immediately
    Given a click action "talk_to_old_man" is available
    When the player performs the click action
    Then the effects of "talk_to_old_man" should be applied

  Scenario: Actions filtered by current location
    Given the player is in "slums"
    Then only actions for "slums" should be visible

  Scenario: Actions filtered by requirements
    Given the player has "strength" at level 5
    And an action requires "strength" level 10
    Then that action should not be available

  Scenario: Story flag requirements filter actions
    Given the "amulet_glowing" story flag is not set
    Then the "touch_amulet" action should not be available

  Scenario: Locked actions show requirements
    Given the player is in "slums"
    And the player has "beggar" job at level 3
    Then the "Travel to the Fields" action should be disabled
    And it should show "Requires: Beggar Lv.5"
