import { promisify } from 'util';
import * as Translator from 'google-translate';

const translator = Translator(process.env.TRANSLATE_API_KEY);
translator.translatePromise = promisify(translator.translate);
translator.detectLanguagePromise = promisify(translator.detectLanguage);

const SUPPORTED_LANGUAGES = (process.env.SUPPORTED_LANGUAGES || '').split(',');
const PRIMARY_LANGUAGE = SUPPORTED_LANGUAGES[0]
const SECONDARY_LANGUAGE = SUPPORTED_LANGUAGES[1]

export async function translate(text: string): Promise<string> {
    try {
        const { language: inputLanguage } = await translator.detectLanguagePromise(text);
        const targetLanguage = determineTargetLanguage(inputLanguage);
        const { translatedText } = await translator.translatePromise(text, inputLanguage, targetLanguage)
        return translatedText;
  } catch (error) {
        console.error(error);
        return 'Translation Failure';
    }
}

function determineTargetLanguage(inputLanguage: string): string {
    if (inputLanguage === PRIMARY_LANGUAGE) {
        return SECONDARY_LANGUAGE;
    }
    return PRIMARY_LANGUAGE
}

function isPrimaryLanguage(language) {
    return SUPPORTED_LANGUAGES.indexOf(language) === 0
}