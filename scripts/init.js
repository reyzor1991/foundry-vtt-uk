Hooks.once('init', async function () {
	
	const systemTranslationsFolder = "modules/pfe2ukua/";
	const moduleTranslationsFolder = systemTranslationsFolder + "modules/";
	
	const systemFiles = ["pf2-lang/uk.json", "pf2-lang/re-uk.json", "pf2-lang/action-uk.json"]
	const moduleFiles = [
		{"id":"babele", "path":"babele.json"}
	]

	game.settings.register('pfe2ukua', 'translateSystem', {
        name: "Переклад інтерфейсу PF2e для Foundry VTT українською мовою",
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
			game.settings.register("pfe2ukua", "translateModule_" + m.id, {
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
        libWrapper.register("pfe2ukua",
            "game.i18n._getTranslations",
            loadSelectedTranslations,
            "MIXED");
    }
    else {
        new Dialog({
            title: "Вибір перекладу",
            content: `<p>Для работы модуля перевода необходимо активировать модуль <b>libWrapper</b></p>`,
            buttons: {
                done: {
                    label: "ОК!",
                },
            },
        }).render(true);
    }

    async function loadSelectedTranslations(wrapped, lang) {
        const defaultTranslations = await wrapped(lang);
        const promises = [];
		
		if (game.i18n.lang != "uk")
			return defaultTranslations;
		
		if(game.settings.get("pfe2ukua", "translateSystem")){
			systemFiles.forEach(f =>{
				promises.push(this._loadTranslationFile(systemTranslationsFolder + f));
			});
		}
		
		moduleFiles.forEach(m =>{
			let id = m.id;		
			let module = game.modules.get(m.id);
		
			if(module?.active && game.settings.get("pfe2ukua", "translateModule_" + m.id)){
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