Hooks.on('init', () => {

    if(typeof Babele !== 'undefined') {
        Babele.get().register({
            module: 'pfe2ukua',
            lang: 'uk',
            dir: 'compendium'
        });
    }
});
