// app/routes/index.tsx
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/start';
import * as fs from 'fs';
import React from 'react';

const filePath = 'count.txt';

async function readCount() {
	return parseInt(
		await fs.promises.readFile(filePath, 'utf-8').catch(() => '0')
	);
}

const getCount = createServerFn('GET', () => {
	return readCount();
});

const updateCount = createServerFn('POST', async (addBy: number) => {
	const count = await readCount();
	await fs.promises.writeFile(filePath, `${count + addBy}`);
});

const getGithubCredentials = createServerFn('GET', async (username: string) => {
	const response = await fetch(`https://api.github.com/users/${username}`);
	return await response.json();
});

export const Route = createFileRoute('/')({
	component: Home,
	loader: async () => await getCount(),
});

function Home() {
	const router = useRouter();

	const [input, setInput] = React.useState('');
	const [data, setData] = React.useState('');
	const state = Route.useLoaderData();

	return (
		<div>
			<div>{JSON.stringify(data)}</div>
			<input
				type="text"
				placeholder="Get info about user"
				value={input}
				onChange={(e) => {
					setInput(e.target.value);
				}}
			/>
			<button
				onClick={async () => {
					const data = await getGithubCredentials(input);
					setData(data);
					router.cleanCache();
				}}
			>
				Send
			</button>
		</div>
	);
}
