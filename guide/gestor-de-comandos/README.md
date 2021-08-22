# Administrador de comandos

A menos de que tu bot sea un proyecto pequeño, no es una buena idea tener un solo archivo con cadenas gigantes de if/else if para los comandos. Si quieres implementar más cosas en tu bot y hacer el proceso de desarrollo mucho menos doloroso, querrás implementar un administrador de comandos. ¡Empecemos!

Esta es la base del código que usaremos:

```js
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
	console.log('¡Estoy listo!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong.');
	} else if (commandName === 'beep') {
		await interaction.reply('Boop!');
	}
	// ...
});

client.login(token);
```

## Archivos individuales para comandos

Antes de nada, crea una copia de la carpeta actual de tu bot. Si seguiste la guía desde el inicio, la estructura completa de tu carpeta debería verse algo así: 

```:no-line-numbers
bot-de-discord/
├── node_modules
├── config.json
├── index.js
├── package-lock.json
└── package.json
```
Ahora, abre tu terminal e instala el paquete [`@discordjs/builders`](https://github.com/discordjs/builders) ejecutando `npm install @discordjs/builders`,Ya que usaremos los métodos de utilidad de este paquete en los siguientes ejemplos de código. 

En la misma carpeta, crea una nueva carpeta llamada `commands`. Aquí será donde guardaremos todos los comandos, por supuesto. Abre esa carpeta, crea un nuevo archivo llamado `ping.js`, y copia y pega el siguiente código:

```js
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'ping',
	description: '¡Responde un pong!',
	async execute(interaction) {
		await interaction.reply('¡Pong!');
	},
};
```

Ahora puedes hacer lo mismo con el resto de tus comandos y colocarlos en sus respectivos bloques de código dentro de la función `execute()`. Si has estado usando el mismo código que la guía, puedes copiar y pegar tus comandos en sus respectivos archivos, siguiendo el formato de arriba.

::: tip
`module.exports` es como exportas tus datos en Node.js para luego llamarlos con `require()` en otros archivos. Si no estás familiarizado con esto y quieres saber más, puedes revisar [la documentación](https://nodejs.org/api/modules.html#modules_module_exports) para más información.
:::

::: tip
Si necesitas acceso a la instancia de tu cliente dentro de alguno de los archivos de tus comandos, puedes acceder a el vía `interaction.client`. Si necesitas acceso a otros archivos externos, módulos, etc, tendrás que volver a requerirlos al inicio del archivo.
:::

## Leyendo archivos

En el archivo principal de tu bot, haz estas dos adiciones:

```js {1,6}
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.commands = new Collection();
```

::: tip
`fs` es el módulo de archivos de sistema nativo de Node. Puedes leer la documentación [aquí](https://nodejs.org/api/fs.html).
:::

::: tip
Las <DocsLink section="collection" path="class/Collection">Colecciones</DocsLink> son una clase que extiende la clase [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) nativa de JavaScript e incluye más funcionalidades útiles.
:::

El siguiente paso es la forma de obtener dinámicamente todos los archivos de comandos recién creados. El método [`fs.readdirSync()`](https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options) retornará un array de todos los nombres de los archivos en una carpeta, por ejemplo: `['ping.js', 'beep.js']`. Para asegurarte de que solo archivos de comandos sean retornados, usa `Array.filter()` para dejar fuera del array todos los archivos que no sean de JavaScript. Con ese array, puedes hacer un búcle sobre el y establecer tus comandos dinámicamente dentro de la colección que creaste arriba.

```js {3,5-10}
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// establece un nuevo objeto en la colección
	// con el nombre del comando como llave y el módulo exportado como valor.
	client.commands.set(command.name, command);
}
```

## Ejecutando comandos dinámicamente

Con tu colección en `client.commands` hecha, ¡Puedes usarla para obtener y ejecutar tus comandos! Dentro de tu evento `interactionCreate`, elimina tus cadenas de `if`/`else if` de comandos y reemplázalo con esto:

```js {8-13}
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (!client.commands.has(commandName)) return;

	try {
		await client.commands.get(commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: '¡Ocurrió un error al ejecutar este comando!', ephemeral: true });
	}
});
```

Si no hay ningún comando con ese nombre, no tendrás que hacer nada más que agregar un `return` para cancelar la ejecución del resto del código. Si hay uno, usas `.get()` para obtener el comando, llamas su método `.execute()`, y le pasas la variable `interaction` como argumento. En caso de que algo vaya mal, loguea el error en la consola y le hace saber al miembro que ocurrió un error.

¡Y eso es todo! Siempre que quieras crear un nuevo comando, crea un nuevo archivo en tu carpeta `commands`, nómbralo como quieras, y haz lo que hiciste con los otros comandos.

## Resultado final

<ResultingCode path="command-handling/file-setup" />
