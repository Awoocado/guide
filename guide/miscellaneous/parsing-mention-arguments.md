# Analizar argumentos de mención

En un capítulo anterior, aprendimos a crear comandos con la entrada del usuario; También a usar *menciones* como entrada de usuario
Sin embargo, el uso de `message.mentions` puede ocasionar algunos problemas.  
Por ejemplo, no sabe qué mención pertenece a qué argumento.
O si está dividiendo el contenido del mensaje por espacios para obtener los argumentos,
Las menciones seguirán ocupando espacio en su matriz de argumentos, estropeando el resto del análisis de argumentos si no tienes cuidado.

Digamos que estás haciendo un bot para moderar su servidor. Querrás que el bot banee o warnee a la persona mencionada.
Pero, ¿qué pasa si intentas usar el comando de esta manera?

<DiscordMessages>
	<DiscordMessage profile="user">
		!ban <DiscordMention>Offender</DiscordMention> Porque fueron groseros con <DiscordMention>Victim</DiscordMention>.
	</DiscordMessage>
</DiscordMessages>
Obvio que has baneado a Offender por que es al que le has mencionado primero
Sin embargo, la API de Discord no envía las menciones en el orden en que aparecen; En su lugar, están ordenados por su ID.

Si la @Victim se ha unido a Discord antes que @Offender y tiene una ID más pequeña, es posible que se le prohíba la prohibición.
O tal vez alguien hace un mal uso de un comando, el bot aún puede aceptarlo, pero creará un resultado inesperado.
Digamos que alguien usó accidentalmente el comando de prohibición de esta manera:

<DiscordMessages>
	<DiscordMessage profile="user">
		!ban Por que fueron groseros con <DiscordMention>Victim</DiscordMention>.
	</DiscordMessage>
</DiscordMessages>

El bot todavía baneara a alguien, pero volverá a ser @Victim. `message.mentions.users` todavía contiene una mención, que el bot usará. Pero en realidad, querrás que tu bot pueda decirle al usuario que hizo un mal uso del comando.

## Cómo funcionan las menciones de Discord

Discord usa una sintaxis especial para incrustar menciones en un mensaje. Para las menciones del usuario, es la identificación del usuario con `<@` al principio y `>` al final, así: `<@86890631690977280>`. Si tienen un apodo, también habrá un `!` Después de la `@`.
Las menciones de roles y las menciones de canales funcionan de manera similar. Las menciones de roles se ven como `<@& 134362454976102401>` y las menciones de canales como `<#222197033908436994>`.

Eso significa que cuando recibe un mensaje de la API de Discord y contiene menciones, el contenido del mensaje contendrá esa sintaxis especial.
Si tu envías:

<DiscordMessages>
	<DiscordMessage profile="user">
		Cre que deberíamos agregar <DiscordMention>BuenaPersona</DiscordMention> al <DiscordMention type="role" role-color="#3eaf7c">Moderador</DiscordMention> rol
	</DiscordMessage>
</DiscordMessages>

Entonces el `message.content` para ese mensaje se verá así:

<!-- eslint-skip -->
```js
'Creo que deberíamos agregar <@ 86890631690977280> al rol <@ & 134362454976102401>.'
```

## Implementación

Entonces, ¿cómo usas esta nueva información para tu bot?
La mayor parte de su código no cambiará; sin embargo, en lugar de usar `message.mentions` para encontrar los usuarios mencionados, tendrás que hacerlo manualmente.
Esto puede sonar aterrador al principio, pero veráz que es bastante simple una vez que veas el código.

Digamos que ya tienes un controlador de comandos simple como este:

```js
client.on('messageCreate', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
});
```

Ahora puedes probar rápidamente las aguas actualizando el comando avatar.
Esto es lo que tenemos hasta ahora. Es bastante simple; mostrará el avatar de quién usó el comando.
```js {3-7}
client.on('messageCreate', message => {
	// ...
	if (command === 'avatar') {
		const user = message.author;

		return message.channel.send(`Avatar de ${user.username}: ${user.displayAvatarURL({ dynamic: true })}`);
	}
});
```

Pero, ¿cómo se obtiene el usuario correcto ahora? Bueno, esto require unos sencillos pasos. Ponerlo en una función lo hará fácilmente reutilizable. Usaremos el nombre `get User From Mention` aquí:
```js
function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.cache.get(mention);
	}
}
```

Como puedes ver, es una función relativamente sencilla.
Básicamente, solo funciona a través de la estructura de la mención poco a poco:
  1. Comprueba si la mención comienza con `<@` y termina con `>` y luego elimínalos.
  2. Si el usuario tiene un apodo y su mención contiene un `!`, Elimínalo también.
  3. Ahora solo debe dejarse el ID, así que utilícelo para buscar el usuario de la colección `client.users.cache`.
Siempre que encuentra un error con la mención (es decir, estructura no válida), simplemente devuelve "indefinido" para indicar que la mención no es válida.

::: tip
El método `.slice ()` se usa aquí de una manera más avanzada. Puedes leer el [Documentación MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice) para más información.
:::

Ahora tiene una función ingeniosa que puede usar para convertir una mención sin formato en un objeto de usuario adecuado.
Conectarlo al comando te dará esto:

```js {4-11}
client.on('messageCreate', message => {
	// ...
	if (command === 'avatar') {
		if (args[0]) {
			const user = getUserFromMention(args[0]);
			if (!user) {
				return message.reply('Utilice una mención adecuada si desea ver el avatar de otra persona.');
			}

			return message.channel.send(`Avatar de ${user.username}: ${user.displayAvatarURL({ dynamic: true })}`);
		}

		return message.channel.send(`${message.author.username}, tu avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
	}
});
```

Y aquí, conectamos la nueva función al comando.
Si el usuario proporcionó un argumento, debería ser la mención del usuario, por lo que simplemente se pasa directamente a la función.

¡Y eso es todo! Simple, ¿no es así? Inicia tu bot y ve si funciona.

<DiscordMessages>
	<DiscordMessage author="Awoo" avatar="green">
		!avatar <DiscordMention profile="user" />
	</DiscordMessage>
	<DiscordMessage profile="bot">
		Avatar del usuario:
		<a href="https://i.imgur.com/AfFp7pu.png" target="_blank" rel="noreferrer noopener">https://cdn.discordapp.com/avatars/123456789012345678/0ab1c2d34efg5678902345h6i7890j12.png</a>
		<br />
		<img src="https://i.imgur.com/AfFp7pu.png" style="width: 128px; height: 128px;" alt="" />
	</DiscordMessage>
</DiscordMessages>

Así que ahora, en lugar de usar `message.mentions`, puedes usar tu nueva y fantástica función.
Esto te permitirá agregar comprobaciones adecuadas para todos sus argumentos para que pueda saber cuándo un comando se usa y no se usa correctamente.

Pero esto no marca el final de la página. Si te sientes aventurero, puede seguir leyendo y aprender a usar las expresiones regulares para convertir fácilmente una mención en un objeto de usuario en solo dos líneas.

### Comando ban

Ahora sabes cómo analizar las menciones de los usuarios para un comando simple como el comando avatar. Sin embargo, el comando avatar no se beneficia tanto como el ejemplo de la introducción.

Al escribir un comando de ban en el que puede aparecer una mención en el motivo, las menciones de análisis manual son mucho más importantes. Puede ver un ejemplo de cómo hacerlo de la siguiente manera:
```js {1,3-21}
client.on('messageCreate', async message => {
	// ...
	if (command === 'ban') {
		if (args.length < 2) {
			return message.reply('Menciona al usuario que quieres banear y especifique un motivo de este.');
		}

		const user = getUserFromMention(args[0]);
		if (!user) {
			return message.reply('Utiliza una mención adecuada si desea banear a alguien.');
		}

		const reason = args.slice(1).join(' ');
		try {
			await message.guild.members.ban(user, { reason });
		} catch (error) {
			return message.channel.send(`No se puedo banear: **${user.tag}**: ${error}`);
		}

		return message.channel.send(`Se baneo a **${user.tag}** correctamente de este servidor!`);
	}
});
```

Ahora, si envías un comando como el siguiente, siempre puedes estar seguro de que usarás la mención al principio para averiguar a quién banear, y validarás adecuadamente la mención:

<DiscordMessages>
<DiscordMessage profile = "usuario">
!ban <DiscordMention>Offender</DiscordMention>porque fue groseros con<DiscordMention>Victim</DiscordMention>.
</DiscordMessage>
</DiscordMessages>

### Uso de expresiones regulares

Anteriormente, aprendiste a usar funciones rudimentarias relacionadas con cadenas para convertir la sintaxis de mención especial que usa Discord en un objeto de usuario de discord.js adecuado.
Pero usando expresiones regulares (también conocidas como "RegEx" o "RegExp"), ¡puedes condensar toda esa lógica en una sola línea! Loco, ¿verdad?

Si nunca antes has trabajado con expresiones regulares, esto puede parecer abrumador. Pero, de hecho, ya has utilizado expresiones regulares. ¿Recuerda `withoutPrefix.split (/ + /);`? Este pequeño `/ + /` es una expresión regular. El `/` a cada lado le dice a JavaScript dónde comienza y dónde termina la expresión regular; el material intermedio es su contenido.

::: tip
Para obtener una explicación más detallada, consulte la [Documentación de MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp).
:::

La expresión regular que utilizarás para las menciones de los usuarios tendrá este aspecto: `/ ^ <@ !? (\ d +)> $ /`.
Así es como funciona la expresión regular:

 1. El `^` al principio y el `$` al final significa que la mención debe ocupar toda la cadena.
 2. Tiene los típicos `<@` y `>` al principio y al final.
 3. El `?` Después del `!` Indica que el `!` Es opcional.
 4. `\ d +` significa que la expresión regular buscará varios dígitos, que serán el ID.
 5. Los paréntesis alrededor de `\ d +` crean un grupo de captura, que le permite sacar el ID de la mención.

Usando el método `.match ()` en cadenas, puedes obtener los valores del grupo de captura, es decir, el ID de la mención.

::: advertencia ADVERTENCIA
discord.js tiene <DocsLink path = "class / MessageMentions? scrollTo = s-CHANNELS_PATTERN"> patrones integrados </DocsLink> para las menciones coincidentes, sin embargo, a partir de la versión 11.4 no contienen ningún grupo
y, por lo tanto, no son útiles para eliminar la identificación de la mención.
:::

Actualizar su función `getUserFromMention` para usar RegEx le da esto:

```js
function getUserFromMention(mention) {
	//La identificación es la primera y única coincidencia encontrada por la expresión regular.
	const matches = mention.match(/^<@!?(\d+)>$/);

	// Si la variable proporcionada no fue una mención, las coincidencias serán nulas en lugar de un array
	if (!matches) return;

	// Sin embargo, el primer elemento del array de coincidencias será la mención completa, no solo el ID,
    // Entonces usa el index 1.
	const id = matches[1];

	return client.users.cache.get(id);
}
```

Ves?? Eso es *mucho* más corto y no tan complicado.
Si vuelves a ejecutar tu bot ahora, todo debería de funcionar igual.

## Resultado del código

<ResultingCode />
