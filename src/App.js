import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
	AdaptivityProvider,
	useAdaptivity,
	AppRoot,
	View,
} from "@vkontakte/vkui";
import {Block} from "./panels/Block";



const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);


	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			setUser(user);

		}
		fetchData();
	}, []);

	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
	};

	return (
		<AdaptivityProvider>
			<AppRoot>
				<Block/>
			</AppRoot>
		</AdaptivityProvider>
	);
}

export default App;
