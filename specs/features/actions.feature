Feature: Actions System
  Players interact through click actions (story/travel) and
  continuous actions (progression). Players can run one job action
  and one skill action simultaneously.

  # Summary: Click actions (instant, story/travel) + continuous actions (per-tick, progression).
  # Dual action slots: one job + one skill simultaneously. Location-filtered, requirement-gated.

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

  Scenario: Active actions stop on location change
    Given the player is performing "begging" job action
    And the player is performing "train_concentration" skill action
    When the player changes location
    Then no job action should be active
    And no skill action should be active
    And isRunning should be false

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

  Scenario: Decline the Proposal requires bandit_proposal_active flag
    Given the player is in "prison"
    And the "bandit_proposal_active" story flag is not set
    When the player checks available actions
    Then "Decline the Proposal" should not be available

  Scenario: Both bandit actions available when proposal is active
    Given the player is in "prison"
    And the "bandit_proposal_active" story flag is set
    And the player has "strength" at level 8
    When the player checks available actions
    Then "Decline the Proposal" should be available
    And "Lift the Loose Stone" should be available

  Scenario: Lifting stone restores gruel and joins bandits but stays in prison
    Given the player is in "prison"
    And the "bandit_proposal_active" story flag is set
    And the player has "strength" at level 8
    When the player performs "bandit_lift_stone" action
    Then the player should join the "bandits" clan
    And the player's current food should be "prison_food"
    And the "bandit_proposal_active" story flag should not be set
    And the player should still be in "prison"

  Scenario: Declining proposal leaves player without gruel
    Given the player is in "prison"
    And the "bandit_proposal_active" story flag is set
    When the player performs "bandit_give_up" action
    Then the "bandit_proposal_active" story flag should not be set
    And the player's current food should be null
    And the player should still be in "prison"
