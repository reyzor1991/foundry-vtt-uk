Hooks.once('init', async function () {

    const moduleName = 'pfe2ukua'
	const systemTranslationsFolder = "modules/pfe2ukua/";
	const pf2TranslationsFolder = systemTranslationsFolder + "pf2-lang/";
	const moduleTranslationsFolder = systemTranslationsFolder + "modules/";

	const pf2Files = ["action-uk.json", "re-uk.json", "uk.json"]
	const moduleFiles = []

	game.settings.register(moduleName, 'translateSystem', {
        name: "Translation: Ukrainian [PF2e]",
        scope: 'world',
        type: Boolean,
        config: true,
        default: true,
        restricted: true,
        requiresReload: true
    });

	moduleFiles.forEach(m =>{
		let id = m.id;
		let module = game.modules.get(m.id);

		console.log("Checking mod: " + m.id);
		if(module?.active){
			game.settings.register(moduleName, "translateModule_" + m.id, {
				name: "Переклад модуля " + module.title,
				scope: 'world',
				type: Boolean,
				config: true,
				default: true,
				restricted: true,
				requiresReload: true
			});
		}
	});

    if (typeof libWrapper === "function") {
        libWrapper.register(moduleName
            "game.i18n._getTranslations",
            loadSelectedTranslations,
            "MIXED");
    }
    else {
        new Dialog({
            title: "Выбор перевода",
            content: `<p>Для работы модуля перевода необходимо активировать модуль <b>libWrapper</b></p>`,
            buttons: {
                done: {
                    label: "Хорошо",
                },
            },
        }).render(true);
    }

    async function loadSelectedTranslations(wrapped, lang) {
        const defaultTranslations = await wrapped(lang);
        const promises = [];

		if (game.i18n.lang != "uk")
			return defaultTranslations;

		if(game.settings.get(moduleName, "translateSystem")){
			pf2Files.forEach(f =>{
				promises.push(this._loadTranslationFile(pf2TranslationsFolder + f));
			});
		}

		moduleFiles.forEach(m =>{
			let id = m.id;
			let module = game.modules.get(m.id);

			if(module?.active && game.settings.get(moduleName, "translateModule_" + m.id)){
				promises.push(this._loadTranslationFile(moduleTranslationsFolder + m.path));
			}
		});

        await Promise.all(promises);
        for (let p of promises) {
            let json = await p;
            foundry.utils.mergeObject(defaultTranslations, json, { inplace: true });
        }

        return defaultTranslations;
    }

});