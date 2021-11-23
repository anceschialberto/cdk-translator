/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const translateClient = new TranslateClient({});
const eventBridgeClient = new EventBridgeClient({});

exports.buildTranslationRequest = function (language: any, text: any) {
  const translateParams = {
    SourceLanguageCode: "en",
    TargetLanguageCode: language,
    Text: text,
  };
  const translateCommand = new TranslateTextCommand(translateParams);
  return translateClient.send(translateCommand);
};

exports.buildEventBridgePackage = function (translations: any, id: any) {
  const entries = translations.map((item: any) => {
    item["id"] = id;
    return {
      Detail: JSON.stringify(item),
      DetailType: "translation",
      EventBusName: process.env.TRANSLATE_BUS,
      Source: "website",
    };
  });
  return {
    Entries: entries,
  };
};

exports.handler = async function (event: any) {
  const body = JSON.parse(event.body);
  const translateText = body.text;
  const lang = body.languages;

  const translations = lang.map((item: any) => {
    return exports.buildTranslationRequest(item, translateText);
  });

  try {
    // get translations
    const translateResponse = await Promise.all(translations);
    const data = translateResponse.map((item: any) => {
      return {
        language: item.TargetLanguageCode,
        translation: item.TranslatedText,
      };
    });
    data.push({ language: "en", translation: translateText });

    // send events to eventbridge
    const eventBridgeCommand = new PutEventsCommand(
      exports.buildEventBridgePackage(data, event.requestContext.requestId)
    );

    const ebresults = await eventBridgeClient.send(eventBridgeCommand);
    console.log(ebresults);

    return { id: event.requestContext.requestId, Items: data };
  } catch (error) {
    throw new Error((error as any).message);
  }
};
