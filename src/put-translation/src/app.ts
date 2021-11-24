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
import { APIGatewayEvent } from "aws-lambda";

const translateClient = new TranslateClient({});
const eventBridgeClient = new EventBridgeClient({});

const buildTranslationRequest = (language: string, text: string) => {
  const translateParams = {
    SourceLanguageCode: "en",
    TargetLanguageCode: language,
    Text: text,
  };
  const translateCommand = new TranslateTextCommand(translateParams);
  return translateClient.send(translateCommand);
};

const buildEventBridgePackage = (
  translations: Array<{
    id?: string;
    language?: string;
    translation?: string;
  }>,
  id: string
) => {
  const entries = translations.map((item) => {
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

export const handler = async (event: APIGatewayEvent) => {
  const body = JSON.parse(event.body ?? "{}") as {
    text: string;
    languages: Array<string>;
  };
  const translateText = body.text;
  const lang = body.languages;

  const translations = lang.map((item) => {
    return buildTranslationRequest(item, translateText);
  });

  try {
    // get translations
    const translateResponse = await Promise.all(translations);
    const data = translateResponse.map((item) => {
      return {
        language: item.TargetLanguageCode,
        translation: item.TranslatedText,
      };
    });
    data.push({ language: "en", translation: translateText });

    // send events to eventbridge
    const eventBridgeCommand = new PutEventsCommand(
      buildEventBridgePackage(data, event.requestContext.requestId)
    );

    const ebresults = await eventBridgeClient.send(eventBridgeCommand);
    console.log(ebresults);

    return { id: event.requestContext.requestId, Items: data };
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    else throw error;
  }
};
