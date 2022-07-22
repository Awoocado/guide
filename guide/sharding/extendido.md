# Cambios extendidos

::: tip
Esta página es una continuación y basa su código en [la pagina anterior](/sharding/informacion-adicional.md), que asume conocimientos de argumentos y funciones de paso. 
:::

## Enviar mensajes a través de fragmentos

Comencemos con el uso básico de fragmentos. En algún momento del desarrollo del bot, es posible que haya querido enviar un mensaje a otro canal, que puede estar o no necesariamente en el mismo gremio, lo que significa que puede estar o no en el mismo fragmento. Para lograr esto, deberá volver a su amigo `.broadcastEval()` y probar cada fragmento para el canal deseado. Suponga que tiene el siguiente código en su evento `interactionCreate`:

```js {3-11}
client.on('interactionCreate', interaction => {
	// ...
	if (commandName === 'send') {
		const id = interaction.options.getString('destination');
		const channel = client.channels.cache.get(id);

		if (!channel) return interaction.reply('No pude encontrar el canal.');

		channel.send('Hello!');
		return interaction.reply(`He enviado un mensaje a: \`${id}\`!`);
	}
});
```

Esto nunca funcionará para un canal que se encuentra en otro fragmento. Entonces, vamos a remediar esto.

::: tip
En discord.js v13, <DocsLink path="class/ShardClientUtil?scrollTo=ids">`Client#shard`</DocsLink> puede contener múltiples identificaciones. Si usa el administrador de fragmentación predeterminado, la matriz `.ids` solo tendrá una entrada.
:::

```js {4-13}
if (commandName === 'send') {
	const id = interaction.options.getString('destination');
	return client.shard.broadcastEval(async (c, { channelId }) => {
		const channel = c.channels.cache.get(channelId);
		if (channel) {
			await channel.send(`Este es un mensaje de fragmento ${c.shard.ids.join(',')}!`);
			return true;
		}
		return false;
	}, { context: { channelId: id } })
		.then(console.log);
}
```

Si todo está bien, debería notar una salida como `[falso, verdadero, falso, falso]`. Si no está claro por qué `verdadero` y `falso` están dando vueltas, se devolverá la última expresión de la declaración eval. Querrás esto si quieres algún comentario de los resultados. Ahora que ha observado dichos resultados, puede ajustar el comando para obtener la retroalimentación adecuada, así:

```js {4-10}
return client.shard.broadcastEval(c => {
	// ...
})
	.then(sentArray => {
		// Search for a non falsy value before providing feedback
		if (!sentArray.includes(true)) {
			return message.reply('No pude encontrar el canal.');
		}
		return message.reply(`He enviado un mensaje a: \`${id}\`!`);
	});
```

¡Y eso es todo por esta sección! Te has comunicado con éxito en todos tus fragmentos.

## Uso de funciones continuación

Si recuerdas, hubo una breve mención de pasar funciones a través de `.broadcastEval()`, pero no una descripción muy clara de cómo hacerlo exactamente. Bueno, no se preocupe, ¡esta sección lo cubrirá! Suponga que tiene el siguiente código en su evento `interactionCreate`:

```js {3-8}
client.on('interactionCreate', message => {
	// ...
	if (commandName === 'emoji') {
		const emojiId = interaction.options.getString('emoji');
		const emoji = client.emojis.cache.get(emojiId);

		return message.reply(`He encontrado un emoji: ${emoji}!`);
	}
});
```

El código antes mencionado esencialmente buscará a través de `client.emojis.cache` la identificación proporcionada, que será proporcionada por la opción `emoji`. Sin embargo, con la fragmentación, es posible que observe que no busca en todos los emojis del cliente. Como se mencionó en una sección anterior de esta guía, los diferentes fragmentos dividen el cliente y su caché. Los emojis se derivan de los gremios, lo que significa que cada fragmento tendrá los emojis de todos los gremios para ese fragmento. La solución es usar `.broadcastEval()` para buscar en todos los fragmentos el emoji deseado.

Comencemos con una función básica, que intentará tomar un emoji del cliente actual y devolverlo.

```js
function findEmoji(c, { nameOrId }) {
	return c.emojis.cache.get(nameOrId) || c.emojis.cache.find(e => e.name.toLowerCase() === nameOrId.toLowerCase());
}
```

A continuación, debe llamar a la función en su comando correctamente. Si recuerdas [esta selección](/sharding/informacion-adicional.md#eval-arguments),se muestra allí cómo pasar una función y argumentos correctamente.

```js {4-7}
client.on('interactionCreate', interaction => {
	// ...
	if (commandName === 'emoji') {
		const emojiNameOrId = interaction.options.getString('emoji');

		return client.shard.broadcastEval(findEmoji, { context: { nameOrId: emojiNameOrId } })
			.then(console.log);
	}
});
```

Ahora, ejecute este código y seguramente obtendrá un resultado similar al siguiente:
<!-- eslint-skip  -->

```js
[
	{ 
		guild: { 
			members: {},
			// ...
			id: '222078108977594368',
			name: 'discord.js Official',
			icon: '6e4b4d1a0c7187f9fd5d4976c50ac96e',
			// ...
			emojis: {} 
		},
		id: '383735055509356544',
		name: 'duckSmug',
		requiresColons: true,
		managed: false,
		animated: false,
		_roles: []
	}
]
```

Si bien este resultado no es *necesariamente* malo o incorrecto, es simplemente un objeto sin procesar que recibió 'JSON.parse()' y 'JSON.stringify()', por lo que todas las referencias circulares desaparecieron. Más importante aún, el objeto ya no es un verdadero objeto `GuildEmoji` como lo proporciona discord.js. *Esto significa que ninguno de los métodos convenientes que normalmente se le brindan está disponible.* Si esto es un problema para usted, querrá manejar el elemento *dentro* de `broadcastEval`. Convenientemente, se ejecutará la función `findEmoji`, por lo que debe ejecutar sus métodos relevantes allí, antes de que el objeto abandone el contexto.

```js {2-3,5-6}
function findEmoji(c, { nameOrId }) {
	const emoji = c.emojis.cache.get(nameOrId) || c.emojis.cache.find(e => e.name.toLowerCase() === nameOrId.toLowerCase());
	if (!emoji) return null;
	// Si quisieras eliminar el emoji con discord.js, aquí es donde lo harías.
	De lo contrario, no incluya este código.
	emoji.delete();
	return emoji;
}
```

Con todo lo dicho y hecho, por lo general querrás mostrar el resultado, así que así es como puedes hacerlo:

```js {2-7}
return client.shard.broadcastEval(findEmoji, { context: { nameOrId: emojiNameOrId } })
	.then(emojiArray => {
		// Localiza un resultado no falso, que será el emoji en cuestión
		const foundEmoji = emojiArray.find(emoji => emoji);
		if (!foundEmoji) return message.reply('no pude encontrar ese emoji.');
		return message.reply(`I have found the ${foundEmoji.animated ? `<${foundEmoji.identifier}>` : `<:${foundEmoji.identifier}> emoji!`}!`);
	});
```

¡Y eso es todo! El emoji debería estar bastante impreso en un mensaje, como era de esperar.

## Código resultante

<ResultingCode />
