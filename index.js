import { AppRegistry } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widget/widget-task-handler';
import App from './App';
import { name as appName } from './app.json';

registerWidgetTaskHandler(widgetTaskHandler);
AppRegistry.registerComponent(appName, () => App);
