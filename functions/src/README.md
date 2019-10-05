# Run Tests

Install Node.js and then run the commands from the `src/` directory.

    node test.js
    node test_ground_truth.js


# Example Output

Output from running inference test.
[Source](https://github.com/cartland/Marauder/tree/c74042630446dc5f7cad5036a2b18b2202d6644c/functions/src)

    node test_ground_truth.js

Output:

    2019-09-09T00:59:39.157Z
    TIME INFERENCE: Performing updates for 4 seconds
    TIME INFERENCE: Completed updates for 4 seconds

    OBSERVATION: kitchen: -96
    living_room     :24.08% *************************
    kitchen         :37.65% **************************************
    patio           :26.85% ***************************
    nick_bedroom    : 3.52% ****
    stromme_bedroom : 2.67% ***
    hallway         : 5.22% ******

    INFERENCE: WRONG - actual: hallway, guess: kitchen

    TOTAL GUESSES:63
    TOTAL CORRECT:41 (65.08%)
    guess↓ actual→  | stromme_bedroom | nick_bedroom | living_room | kitchen | patio | hallway
    stromme_bedroom |               5 |            0 |           0 |       0 |     0 |       0 |
       nick_bedroom |               0 |            2 |           0 |       0 |     0 |       0 |
        living_room |               0 |            0 |          18 |      15 |     1 |       0 |
            kitchen |               0 |            0 |           0 |      16 |     4 |       2 |
              patio |               0 |            0 |           0 |       0 |     0 |       0 |
            hallway |               0 |            0 |           0 |       0 |     0 |       0 |

