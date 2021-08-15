# Sintaxis ES6

Si has usado JavaScript por una (relativamente) pequeña cantidad de tiempo, o no tienes mucha experiencia con él, puede que no sepas qué es ES6 y qué características incluye. Dado que esta es una guía principalmente para los bots de Discord, usaremos algo de discord.js como un ejemplo de los beneficios de ES6.

Aquí está el código de inicio que usaremos:

<!-- eslint-disable prefer-template -->
<!-- eslint-disable prefer-destructuring -->

```js
const { Client, Intents } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    console.log('¡Estoy listo!');
});

client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        interaction.reply('Pong.');
    } else if (commandName === 'beep') {
        interaction.reply('Boop.');
    } else if (commandName === 'server') {
        interaction.reply('Nombre del servidor: ' + interaction.guild.name + '\nMiembros totales: ' + interaction.guild.memberCount);
    } else if (commandName === 'user-info') {
        interaction.reply('Tu nombre de usuario: ' + interaction.user.username + '\nTu Id: ' + interaction.user.id);
    }
});

client.login(config.token);
```

Si no te has dado cuenta, ¡Este código ya está usando un poco de ES6! El uso de `const` y la función "flecha" (`() => ...`) es sintaxis ES6, y recomendamos usarla siempre que sea posible.

En cuanto al código anterior, hay algunas cosas que se podrían mejorar. Veámoslas.

## Literales de plantilla

Si revisas el código de arriba, está haciendo cosas como `'Nombre del servidor: ' + interaction.guild.name` y `'Tu nombre de usuario: ' + interaction.user.username`, que es perfectamente válido. Sin embargo, es un poco difícil de leer, y no es demasiado entretenido escribirlo constantemente. Afortunadamente, hay una mejor alternativa.

<!-- eslint-skip -->

```js
// ES5, la versión que tenemos
else if (commandName === 'server') {
    interaction.reply('Nombre del servidor: ' + interaction.guild.name + '\nMiembros totales: ' + interaction.guild.memberCount);
}
else if (commandName === 'user-info') {
    interaction.reply('Tu nombre de usuario: ' + interaction.user.username + '\nTu Id: ' + interaction.user.id);
}
```<!-- eslint-skip -->```js
// Versión ES6, usando literales de plantilla
else if (commandName === 'server') {
    interaction.reply(`Nombre del servidor: ${interaction.guild.name}\nMiembros totales: ${interaction.guild.memberCount}`);
}
else if (commandName === 'user-info') {
    interaction.reply(`Tu nombre de usuario: ${interaction.user.username}\nTu Id: ${interaction.user.id}`);
}
```

¡Más fácil de leer y de escribir! Lo mejor de ambos mundos.

### Literales de plantilla contra concatenación de cadenas de texto

Si ha usado otros lenguajes de programación, puedes estar familiarizado con el término "string interpolation". "Template literals" es la implementación de javascript de la interpolación de cadenas. Si estás familiarizado con la sintaxis de heredoc, es muy parecida; permite la interpolación de cadenas, así como cadenas multilíneas.

El siguiente ejemplo no entrará demasiado en detalles sobre el mismo, pero si estás interesado en saber más, puedes leer sobre ellos en [la documentación de MDN](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals).

```js
// variables y funciones usadas en los ejemplos 
const username = 'Sanctuary';
const password = 'pleasedonthackme';

function letsPretendThisDoesSomething() {
    return 'Yay for sample data.';
}
```<!-- eslint-disable prefer-template -->```js
// concatenación de strings
console.log('Your username is: **' + username + '**.');
console.log('Your password is: **' + password + '**.');

console.log('1 + 1 = ' + (1 + 1));

console.log('And here\'s a function call: ' + letsPretendThisDoesSomething());

console.log(
    'Putting strings on new lines\n'
    + 'can be a bit painful\n'
    + 'with string concatenation. :(',
);
```

```js
// template literals
console.log(`Your password is: **${password}**.`);
console.log(`Your username is: **${username}**.`);

console.log(`1 + 1 = ${1 + 1}`);

console.log(`And here's a function call: ${letsPretendThisDoesSomething()}`);

console.log(`
    Putting strings on new lines
    is a breeze
    with template literals! :)
`);

// NOTA: los "template literals" también renderizan las sangria dentro de ellos
// Hay varias maneras de hacerlo que discutiremos en otro momento.
```

Puedes ver cómo hace las cosas más fáciles y más legibles. ¡En algunos casos, incluso pude acortar su código! Este es algo que querrás aprovechar tanto como sea posible.

## Funciones flecha

Las funciones flecha son una abreviatura de las funciones normales, con la adición de que utilizan un contexto léxico `this` dentro del suyo propio. Si no sabes a qué se refiere la palabra clave `this`, no te preocupes; aprenderás más sobre ella a medida que avances.

Aquí tienes algunos ejemplos de cómo puedes beneficiarte de las funciones flecha sobre funciones regulares:

<!-- eslint-disable func-names, no-var, prefer-arrow-callback, prefer-template -->

```js
// funciones regulares, ES5 completo
client.once('ready', function() {
    console.log('Ready!');
});

client.on('typingStart', function(channel, user) {
    console.log(user + ' started typing in ' + channel);
});

client.on('messageCreate', function(message) {
    console.log(message.author + ' sent: ' + message.content);
});

var doubleAge = function(age) {
    return 'Your age doubled is: ' + (age * 2);
};

// dentro de un collector de mensajes
var filter = function(m) {
    return m.content === 'I agree' && !m.author.bot;
};

var collector = message.channel.createMessageCollector({ filter, time: 15000 });
```

```js
// funciones "arrow", ES6
client.once('ready', () => console.log('Ready!'));

client. n('typingStart', (canal, usuario) => console.log(`${user} comenzó a escribir en ${channel}`));

client.on('messageCreate', mensaje => consola. og(`${message.author} enviado: ${message.content}`));

const doubleAge = age => `Tu edad duplica es: ${age * 2}`;

// dentro del recolector de mensajes
const filter = m => m. ontent === 'Estoy de acuerdo' && !m.author.bot;
const collector = message.createMessageCollector(filter, { time: 15000 });
```

Hay algunas cosas importantes que debe tener en cuenta:

* Los paréntesis alrededor de los parámetros de la función son opcionales cuando sólo tiene un parámetro, pero son requeridos de otra manera. Si crees que esto te confundirá, puede ser una buena idea usar paréntesis.
* Puedes poner limpiamente lo que necesitas en una sola línea, sin llaves.
* Omitir llaves hará que las funciones "arrow" usen **implicit retrun**, pero solo si tienes una expresión de una sola línea. Las variables `doubleAge` y `filter` son un buen ejemplo de esto.
* A diferencia de la declaración de `función someFunc() { ... }` , las funciones "arrow" no pueden utilizarse para crear funciones con tal sintaxis. Puedes crear una variable y darle una función ""arrow" anónima como el valor, aunque (como se ve con la `doubleAge` y `filter` variables).

No cubriremos el ámbito léxico `this` con funciones "arrow" aquí, pero puedes "googlear" mas sobre eso. De nuevo, si no estás seguro de qué `this` o cuando lo necesitas, leyendo sobre el léxico `this` solo puede confundirte.

## Desestructuración

La desestructuración es una forma fácil de extraer elementos de un objeto o matriz. Si nunca has visto la sintaxis para ella antes, puede ser un poco confusa, pero es fácil de entender una vez explicado

### Desestructuración de objetos

Aquí hay un ejemplo común en el que la destrucción de objetos sería útil:<!-- eslint-skip -->```js
const config = require('./config.json');
const prefix = config.prefix;
const token = config.token;
```

Este código es un poco detallado y no es el más divertido de escribir cada vez. La destrucción de objetos simplifica esto, facilitando tanto la lectura como la escritura. Echa un vistazo:

```js
const { prefix, token } = require('./config.json');
```

La destrucción de objetos toma esas propiedades del objeto y las almacena en variables. Si la propiedad no existe, seguirá creando una variable pero con el valor `undefined`. Así que en lugar de usar `config.token` en tu método `client.login()`, simplemente usarías `token`. Y como la desestructuración crea una variable para cada artículo, ni siquiera necesitas esa línea `const prefix = config.prefix`. ¡Cool!

Adicionalmente, puedes hacer esto en tus comandos.

```js
client.on('interactionCreate', interaction => {
    const { commandName } = interaction;

    if (commandName === 'ping') {
        // comando ping aquí...
    } else if (commandName === 'beep') {
        // comando beep aquí...
    }
    // otros comandos aquí...
});
```

El código es más corto y se ve más limpio, pero no debería ser necesario si sigues [command handler](/command-handling/).

También puede renombrar variables cuando se destruyen, si es necesario. Un buen ejemplo es cuando extrae una propiedad con un nombre que ya está siendo usado o entra en conflicto con una palabra clave reservada. La sintaxis es la siguiente:

```js
// `default` es una palabra clave reservada
const { 'default': defaultValue } = someObject;

console.log(defaultValue);
// 'Algún valor por defecto aquí'
```

### Desestructuración de objetos

La sintaxis de destrucción de sintaxis es muy similar a la destrucción de objetos, excepto que usas corchetes en lugar de llaves. Además, ya que se está usando en una array, se destruyen los elementos en el mismo orden en que se encuentra la array. Sin destrucción de arrays, así es como extraerías elementos de una array:

```js
// asumiendo que estamos en un comando `profile` y tenemos una variable `args`
const name = args[0];
const age = args[1];
const location = args[2];
```

Como el primer ejemplo con la destrucción de objetos, esto es un poco verboso y no divertida de escribir. La destrucción de arrays alivia este dolor.

```js
const [name, age, location] = args;
```

Una sola línea de código que hace las cosas mucho más limpias! En algunos casos, puede que ni siquiera necesite todos los elementos del array (por ejemplo, al usar `string.match(regex)`). La destrucción de arrays todavía le permite operar en el mismo sentido.

```js
const [, username, id] = message.content.match(someRegex);
```

En este snippet, usamos una coma sin proporcionar un nombre para el elemento de la array que no necesitamos. También puedes darle un nombre de marcador de posición si lo prefieres, por supuesto; es totalmente preferible en ese punto.

## var, let y const

Dado que hay muchos, muchos artículos ahí fuera que pueden explicar esta parte más en profundidad, sólo te daremos una TL; R y un enlace de artículo si usted decide leer más sobre él.

1. La palabra clave `var` es lo que fue (y todavía puede ser) usado en JavaScript antes de que `let` y `const` se inventasen. Hay muchos problemas con `var`, sin embargo, tales como ser un ámbito de funciones, aumentar los problemas relacionados y permitir la redeclaración.
2. La palabra clave `let` es esencialmente la nueva variable ``; aborda muchos de los problemas `var` tiene, pero su factor más significativo sería que su ámbito de aplicación en el bloque y no permite la redeclaración (*no* reasignación).
3. La palabra clave `const` es para dar a las variables un valor constante que no puede ser reasignado. tanto `const`, como `let`, son block-scoped.

La regla general recomendada por esta guía es usar `const` siempre que sea posible, `let` de otro modo, y evitar usar `var`. Aquí hay un [artículo útil](https://madhatted.com/2016/1/25/let-it-be) si quieres leer más sobre este tema.
