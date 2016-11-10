/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

 http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


'use strict';

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least 4 answers, any extras will be shuffled in.
 */

var Words = ['GOPAL', 'RANDER'];
var WORD_COUNT = 2;


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

        //     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
        //         context.fail("Invalid Application ID");
        //      }

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // handle yes/no intent after the user has been prompted
    if (session.attributes && session.attributes.userPromptedToContinue) {
        delete session.attributes.userPromptedToContinue;
        if ("AMAZON.NoIntent" === intentName) {
            handleFinishSessionRequest(intent, session, callback);
        } else if ("AMAZON.YesIntent" === intentName) {
            handleRepeatRequest(intent, session, callback);
        }
    }

    // dispatch custom intents to handlers here
    if ("CharIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("DontKnowIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

// Be sure to change this for your skill.
var CARD_TITLE = "Hangman";

function getWelcomeResponse(callback) {
    // Be sure to change this for your skill.
    var sessionAttributes = {},
        //CHANGE THIS TEXT
        speechOutput = "Welcome to Hangman! I am cooking up a word for you. ";
    var shouldEndSession = false,

    //correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT)), // Generate a random index for the correct answer, from 0 to 3
    //roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex),

    roundWordHidden = Words[Math.floor(Math.random() * (WORD_COUNT))],
    roundWord = "_".repeat(roundWordHidden.length);

    //currentQuestionIndex = 0,
    //spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]]),
    //var repromptText = speehOutput;
    var flag = [];
    for (var i = 0; i < 26; i++) {
        flag.push(false);
    }
    speechOutput += "So, The word contains " + roundWordHidden.length + " characters. You have 5 lifes. Start Guessing!";

    sessionAttributes = {
        "speechOutput": speechOutput,
        "repromptText": speechOutput,
        "roundWord": roundWord,
        "roundWordHidden": roundWordHidden,
        "flag": flag,
        "lifes": 5,
        "pending": roundWord.length
    };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, shouldEndSession));
}

function createDashsstring(s) {
    var result = "";
    for (var i = 0; i < s.length; i++) {
        if (s[i] == '_') {
            result += "dash";
        }
        else {
            result += s[i];
        }
        result += ", ";
    }
    return result;
}
function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
}

function handleAnswerRequest(intent, session, callback) {
    var speechOutput = "";
    var sessionAttributes = {};
    var gameInProgress = true;
    var answerSlotValid = isIntentSlotValid(intent);
    var defaultIntent = intent.name === "DontKnowIntent";

    if (!gameInProgress) {
        // If the user responded with an answer but there is no game in progress, ask the user
        // if they want to start a new game. Set a flag to track that we've prompted the user.
        sessionAttributes.userPromptedToContinue = true;
        speechOutput = "Do you want to start over?";
        callback(sessionAttributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
    } else if (!answerSlotValid) {
        // If the user provided answer isn't a number > 0 and < ANSWER_COUNT,
        // return an error message to the user. Remember to guide the user into providing correct values.
        var reprompt = "Try something from A to Z.";
        speechOutput = "Sorry, I did not get that." + reprompt;
        callback(session.attributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, reprompt, false));
    } else {
        //var gameQuestions = session.attributes.questions,
        //    correctAnswerIndex = parseInt(session.attributes.correctAnswerIndex),
        //    currentScore = parseInt(session.attributes.score),
        //    currentQuestionIndex = parseInt(session.attributes.currentQuestionIndex),
        //    correctAnswerText = session.attributes.correctAnswerText;

        var speechOutputAnalysis = "";
        if (intent.name === "CharIntent") {
            var char = intent.slots.Char.value;
            console.log("char = " + char);

            if (session.attributes.flag[char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)] === true) {

            }
            else {
                var hit = false;
                var counthit = 0;
                for (var i = 0; i < session.attributes.roundWord.length; i++) {
                    console.log(session.attributes.roundWord[i] + " " + session.attributes.roundWordHidden[i])
                    if (session.attributes.roundWordHidden[i] == char.toUpperCase() && session.attributes.roundWord[i] == '_') {
                        session.attributes.roundWord = setCharAt(session.attributes.roundWord, i, char.toUpperCase())
                        console.log(session.attributes.roundWord);
                        hit = true;
                        counthit++;
                    }
                }
                session.attributes.flag[char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0)] = true;
                session.attributes.pending = session.attributes.pending - counthit;
                if (hit === false) {
                    session.attributes.lifes = session.attributes.lifes - 1;
                    speechOutput += "I am afraid that was a wrong guess. ";
                    if (session.attributes.lifes === 0) {
                        speechOutput += "You are out of lifes. Better luck next time. The word was, " + createDashsstring(session.attributes.roundWordHidden) + ". Wanna play one more round? Say 'Start'"
                        callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
                    }
                    else {
                        speechOutput += "You have " + session.attributes.lifes + " lifes remaining.. ";
                    }
                    speechOutput += "The word now is " + createDashsstring(session.attributes.roundWord);
                }
                else {
                    speechOutput += "Good Job! "
                    if (session.attributes.pending === 0) {
                        speechOutput += "You have guessed it all! " + createDashsstring(session.attributes.roundWord) + ". Start a new round? Say 'Start'";
                        callback(sessionAttributes, buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
                    }
                    else {
                        speechOutput += "You have " + session.attributes.lifes + " lifes remaining.. ";
                    }
                    speechOutput += "The word now is, " + createDashsstring(session.attributes.roundWord);
                }
            }
        }

        // if currentQuestionIndex is 4, we've reached 5 questions (zero-indexed) and can exit the game session

        session.attributes.speechOutput = speechOutput;
        session.attributes.repromptText = speechOutput;
        callback(session.attributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
    }
}

//keep
function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

//keep
function handleGetHelpRequest(intent, session, callback) {
    // Set a flag to track that we're in the Help state.
    if (session.attributes) {
        session.attributes.userPromptedToContinue = true;
    } else {
        // In case user invokes and asks for help simultaneously.
        session.attributes = { userPromptedToContinue: true };
    }

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "To start over anytime, say, start again."
        + "To repeat the last element, say, repeat. "
        + "Would you like to keep going?",
        repromptText = "Tell me a Genre."
        + "Would you like to keep going?";
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

//keep
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a custom closing statment when the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Thanks for playing Hangman!", "", true));
}

function isIntentSlotValid(intent) {
    var GenreSlotFilled = intent.slots && intent.slots.Char && intent.slots.Char.value;
    return GenreSlotFilled;
}

// ------- Helper functions to build responses -------

//keep
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

//keep
function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

//keep
function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}