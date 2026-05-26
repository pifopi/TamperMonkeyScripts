// ==UserScript==
// @name         Pikalytics Pokémon English to French Translator
// @version      1.2
// @description  Translate pikalytics pokémon name from english to french
// @grant        unsafeWindow
// @grant        GM_getResourceText
// @resource     SPECIES_EN https://raw.githubusercontent.com/kwsch/PKHeX/refs/heads/master/PKHeX.Core/Resources/text/other/en/text_Species_en.txt
// @resource     SPECIES_FR https://raw.githubusercontent.com/kwsch/PKHeX/refs/heads/master/PKHeX.Core/Resources/text/other/fr/text_Species_fr.txt
// @include      https://www.pikalytics.com/calc
// @include      https://www.pikalytics.com/damage-calculator
// @run-at       document-start
// ==/UserScript==

(function()
 {
    'use strict';

    const debug = false;

    function createDictionary()
    {
        const englishLines = GM_getResourceText("SPECIES_EN").split('\n').map(name => name.trim());
        const translatedLines = GM_getResourceText("SPECIES_FR").split('\n').map(name => name.trim());
        const pokemonTranslations = {};
        englishLines.forEach((englishName, index) => {
            if (englishName && translatedLines[index])
            {
                pokemonTranslations[englishName] = translatedLines[index];
            }
        });
        return pokemonTranslations;
    }

    function translatePokemon(pokemonTranslations, originalName)
    {
        const translatedName = pokemonTranslations[originalName];
        if (translatedName)
        {
            // If we have the name in the dictionnary, return immediatly
            return translatedName;
        }
        else if (originalName.includes("/"))
        {
            // Otherwise, if that name was translated previously, return nothing. Indeed pikalytics calls twice getVisiblePokemonDisplayName for a single name
            if (debug)
            {
                console.log(`${originalName} already translated`);
            }
            return "";
        }
        else
        {
            // Otherwise, we might face a mega or something, then we'll need to search trough every pokemon
            for (const key in pokemonTranslations)
            {
                if (originalName.includes(key))
                {
                    return pokemonTranslations[key];
                }
            }
            // Otherwise, we couldn't translate
            if (debug)
            {
                console.log(`Could not find translation for ${originalName}`);
            }
            return "";
        }
    }

    const pokemonTranslations = createDictionary();
    const lookForMethod = setInterval(() => {
        if (typeof unsafeWindow.getVisiblePokemonDisplayName === 'function')
        {
            clearInterval(lookForMethod);
            const originalGetDisplayName = unsafeWindow.getVisiblePokemonDisplayName;
            unsafeWindow.getVisiblePokemonDisplayName = function(name)
            {
                const originalName = originalGetDisplayName(name);
                const translatedName = translatePokemon(pokemonTranslations, originalName);
                if (translatedName != "")
                {
                    return `${originalName}/${translatedName}`;
                }
                else
                {
                    return originalName;
                }
            };

            if (debug)
            {
                console.log("Successfully replaced getVisiblePokemonDisplayName");
            }
        }
        else
        {
            if (debug)
            {
                console.log("Function getVisiblePokemonDisplayName not found. Cannot replace it");
            }
        }
    }, 100);

    setTimeout(() => {clearInterval(lookForMethod);}, 10000);
})();
