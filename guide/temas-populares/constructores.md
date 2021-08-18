# Constructures

discord.js proporciona el paquete [`@discordjs/builders`](https://github.com/discordjs/builders) que contiene una variedad de utilidades que puedes usar al escribir el código de tu bot. Para instalar este paquete, ejecuta `npm install @discordjs/builders` en tu terminal.

## Formateadores

Los formateadores son un conjunto de funciones de utilidad que formatean cadenas de entrada en el formato dado.

### Markdown básico

Los formateadores proporcionan funciones para formatear cadenas en todos los diferentes estilos de Markdown admitidos por Discord.

```js
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote } = require('@discordjs/builders');
const string = '¡Hola!';

const boldString = bold(string);
const italicString = italic(string);
const strikethroughString = strikethrough(string);
const underscoreString = underscore(string);
const spoilerString = spoiler(string);
const quoteString = quote(string);
const blockquoteString = blockQuote(string);
```

### Enlaces

También hay dos métodos para formatear hipervínculos. `hyperlink()` formateará la URL en un enlace enmascarado, y `hideLinkEmbed()` envolverá la URL en `<>`, evitando que se incruste.

```js
const { hyperlink, hideLinkEmbed } = require('@discordjs/builders');
const url = 'https://discord.js.org/';

const link = hyperlink(url);
const hiddenEmbed = hideLinkEmbed(url);
```

### Bloques de código

Puedes usar `inlineCode()` y `codeBlock()` para convertir una cadena de texto en un bloque de código en línea o un bloque de código regular con o sin resaltado de sintaxis.

```js
const { inlineCode, codeBlock } = require('@discordjs/builders');
const jsString = 'const value = true;';

const inline = inlineCode(jsString);
const codeblock = codeBlock(jsString);
const highlighted = codeBlock('js', jsString);
```

### Marcas de tiempo

Con `time()`, puedes formatear las marcas de tiempo y fechas de UNIX en una cadena de tiempo de Discord.

```js
const { time } = require('@discordjs/builders');
const date = new Date();

const timeString = time(date);
const relative = time(date, 'R');
```

### Menciones

Los formateadores también contienen varios métodos para dar formato a los `Snowflakes` en menciones.

```js
const { userMention, memberMention, channelMention, roleMention } = require('@discordjs/builders');
const id = '123456789012345678';

const user = userMention(id);
const nickname = memberMention(id);
const channel = channelMention(id);
const role = roleMention(id);
```

## Constructores de comandos de barra

El generador de slash commands es una clase de utilidad para crear comandos de barra sin tener que construir objetos manualmente.

### Comandos

Aquí hay un slash command simple usando el constructor. Puedes recopilar los datos de tus comandos y usarlos para registrar comandos de barra.

```js
const { SlashCommandBuilder } = require('@discordjs/builders');

const command = new SlashCommandBuilder().setName('ping').setDescription('¡Responde con Pong!');

// Datos que se pueden usar para registrar un comando de barra
const rawData = command.toJSON();
```

### Opciones

Este es un comando con una opción de usuario.

```js {4}
const command = new SlashCommandBuilder()
	.setName('Información')
	.setDescription('¡Obtener información sobre un usuario!')
	.addUserOption(option => option.setName('user').setDescription('El usuario'));
```

### Subcomandos

Este es un comando que contiene dos subcomandos.

```js {4-12}
const command = new SlashCommandBuilder()
	.setName('Información')
	.setDescription('¡Obten información sobre un usuario o un servidor!')
	.addSubcommand(subcommand =>
		subcommand
			.setName('Usuario')
			.setDescription('Información sobre un usuario')
			.addUserOption(option => option.setName('target').setDescription('El usuario')))
	.addSubcommand(subcommand =>
		subcommand
			.setName('server')
			.setDescription('Información sobre el servidor'));
```

