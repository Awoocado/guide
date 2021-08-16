# Almacenando datos con Keyv

[Keyv](https://github.com/lukechilds/keyv) es una simple base de datos de clave-valor que funciona con múltiples backends. Es completamente escalable para el ["Sharding"](/sharding/) y soporta almacenamiento JSON.

## Instalación

```bash
npm install --save keyv
```

Keyv requiere un paquete adicional dependiendo del backend que prefieras usar. Si quieres mantener todo en la memoria, puedes omitir esta parte. De lo contrario, instala uno de los siguientes.

```bash
npm install --save @keyv/redis
npm install --save @keyv/mongo
npm install --save @keyv/sqlite
npm install --save @keyv/postgres
npm install --save @keyv/mysql
```

Crear una instancia de Keyv después de haber instalado Keyv y los controladores necesarios.<!-- eslint-skip -->```js
const Keyv = require('keyv');

// Unos de los siguientes
const keyv = new Keyv(); // para guardar en memoria
const keyv = new Keyv('redis://user:pass@localhost:6379');
const keyv = new Keyv('mongodb://user:pass@localhost:27017/dbname');
const keyv = new Keyv('sqlite://path/to/database.sqlite');
const keyv = new Keyv('postgresql://user:pass@localhost:5432/dbname');
const keyv = new Keyv('mysql://user:pass@localhost:3306/dbname');
```

Asegurate de manejar errores de conexión.

```js
keyv.on('error', err => console.error('Error de conexión:', err));
```

Para una configuración más detallada, lee el [Keyv readme](https://github.com/lukechilds/keyv/blob/master/README.md).

## Uso

Keyv expone una API familiar a los "[Maps](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)". Sin embargo, solo tiene los métodos `set`, `get`, `delete`y `clear`. Además, en lugar de devolver datos inmediatamente, estos métodos retornan [Promesas](/additional-info/async-await.md) que se resuelven con los datos.

```js
(async () => {
    // true
    await keyv.set('foo', 'bar');

    // bar
    await keyv.get('foo');

    // undefined
    await keyv.clear();

    // undefined
    await keyv.get('foo');
})();
```

## Aplicación

Aunque Keyv puede ayudar en cualquier caso donde necesite datos de clave-valor, nos centraremos en configurar un prefijo por guild usando Sqlite.

::: consejo Esta sección seguirá funcionando con cualquier proveedor soportado por Keyv. Recomendamos PostgreSQL para aplicaciones más grandes. :::

### Configuración incial

```js
const Keyv = require('keyv');
const { Client, Intents } = require('discord.js');
const { globalPrefix, token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const prefixes = new Keyv('sqlite://path/to.sqlite');
```

### Usando "Command handler"

Esta guía utiliza un "command handler "comandos muy básico añadiendo cierta complejidad para permitir múltiples prefijos. Mira la guía de "[command handler ](/command-handling/)" para un mejor "command handler".

```js
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    let args;
    // comandos en servidores
if (message.guild) {
        let prefix;

        if (message.content.startsWith(globalPrefix)) {
            prefix = globalPrefix;
        } else {
            //comprueba el prefijo de servidor-nivel
            const guildPrefix = await prefixes.get(message.guild.id);
            if (message.content.startsWith(guildPrefix)) prefix = guildPrefix;
        }

        // si encuentra al prefix establece los argumentos, si no es un comando
        if (!prefix) return;
        args = message.content.slice(prefix.length).trim().split(/\s+/);
    } else {
        // mensajes directos 
       const slice = message.content.startsWith(globalPrefix) ? globalPrefix.length : 0;
        args = message.content.slice(slice).split(/\s+/);
    }

    // consigue el primer argumento después del prefix como el comando
    const command = args.shift().toLowerCase();
});
```

### Comando prefijo

Ahora que tienes un "command handler", puedes hacer un comando para permitir que la gente use su sistema de multiples prefijos.

```js {3-11}
client.on('messageCreate', async message => {
    // ...
    if (command === 'prefijo') {
        // if there's at least one argument, set the prefix
        if (args.length) {
            await prefixes.set(message.guild.id, args[0]);
            return message.channel.send(`Se cambió el prefijo a  \`${args[0]}\``);
        }

        return message.channel.send(`El prefijo es \`${await prefixes.get(message.guild.id) || globalPrefix}\``);
    }
});
```

Probablemente querrá configurar una validación adicional, como los permisos requeridos y la longitud máxima del prefijo.

### Uso

<DiscordMessages>
    <DiscordMessage profile="user">
        .prefijo
    </DiscordMessage>
    <DiscordMessage profile="bot">
        El prefijo es <code class="discord-message-inline-code">.</code>
    </DiscordMessage>
    <DiscordMessage profile="user">
        .prefijo $
    </DiscordMessage>
    <DiscordMessage profile="bot">
        Prefijo establecido a <code class="discord-message-inline-code">$</code>
    </DiscordMessage>
    <DiscordMessage profile="user">
        $prefix
    </DiscordMessage>
    <DiscordMessage profile="bot">
        El prefijo es <code class="discord-message-inline-code">$</code>
    </DiscordMessage>
</DiscordMessages>

## Siguientes pasos

Otras aplicaciones pueden usar Keyv, como ajustes de servidores; crea otra instancia con un [nombre](https://github.com/lukechilds/keyv#namespaces) diferente para cada configuración. Además, puede ser [extendido](https://github.com/lukechilds/keyv#third-party-storage-adapters) para trabajar con cualquier backend de almacenamiento que prefiera.

Revisa el repositorio de [Keyv](https://github.com/lukechilds/keyv) para más información.

## Resultado final

<ResultingCode />
