const RoyalCommands = {
    commands: {
        '/summon_cat': 'מזמן חתול מלכותי חדש',
        '/inspect_treasure': 'בודק את אוצרות הממלכה',
        '/knight_status': 'מציג סטטוס אבירים',
        '/royal_wisdom': 'מציג חוכמה מלכותית',
        '/castle_defense': 'בודק הגנות טירה',
        '/show_riddle': 'מציג חידה חדשה',
        '/grant_title': 'מעניק תואר אצולה',
        '/secret_passage': 'מגלה מעבר סודי',
        '/cat_mission': 'שולח חתול למשימה',
        '/royal_decree': 'מוציא צו מלכותי'
    },

    executeCommand(command) {
        switch(command) {
            case '/summon_cat':
                return `🐱 חתול מלכותי מספר ${Math.floor(Math.random() * 100)} התייצב למשימה!`;
            case '/inspect_treasure':
                return `💎 נמצאו ${Math.floor(Math.random() * 1000)} אבני חן ו-${Math.floor(Math.random() * 100)} ספרי קסמים`;
            case '/knight_status':
                return `⚔️ ${Math.floor(Math.random() * 50)} אבירים בשער, ${Math.floor(Math.random() * 20)} במשימות`;
            case '/royal_wisdom':
                const wisdomLevel = Math.floor(Math.random() * 100);
                return `🧠 רמת החוכמה המלכותית: ${wisdomLevel}% | ${wisdomLevel > 80 ? 'חכם במיוחד!' : 'ממשיך ללמוד...'}`;
            case '/castle_defense':
                const defenseLevel = Math.floor(Math.random() * 100);
                return `🏰 הגנת הטירה: ${defenseLevel}% | ${defenseLevel > 90 ? 'בלתי חדירה!' : 'צריך חיזוקים'}`;
            case '/show_riddle':
                const riddles = [
                    "השקט מתגנב בספרייה\nלא חתול, אולי אביר\nחתולה שחורה עם מלכה\nקיוביט 1 או 0\nהחידה היא השקט",
                    "הלילה יורד על הטירה\nלא נסיכה, אולי חתולה\nאביר חכם עם צל\nקיוביט 1 או 0\nהחידה היא האומץ",
                    "המגדל קורא בשקט\nלא לוחם, אולי חכם\nחתול אפור עם נסיך\nקיוביט 1 או 0\nהחידה היא הזמן"
                ];
                return riddles[Math.floor(Math.random() * riddles.length)];
            default:
                return 'Command not recognized by the Royal Protocol';
        }
    }
};

export default RoyalCommands;