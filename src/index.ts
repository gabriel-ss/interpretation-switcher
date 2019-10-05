import {app, BrowserWindow, ipcMain, dialog} from "electron";
import installExtension, {REACT_DEVELOPER_TOOLS} from "electron-devtools-installer";
import {enableLiveReload, addBypassChecker} from "electron-compile";
import soundAlign from "./track-aligner/trackAligner";
import decode from "./track-aligner/decoder";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode)
	enableLiveReload({strategy: "react-hmr"});
else
	addBypassChecker(filePath => filePath.indexOf(app.getAppPath()) === -1);


const createWindow = async(): Promise<void> => {

	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1100,
		height: 700,
		icon: `${__dirname}/assets/icon.png`,
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	if (isDevMode) {

		await installExtension(REACT_DEVELOPER_TOOLS);
		mainWindow.webContents.once("dom-ready", () => {

			(mainWindow as Electron.BrowserWindow).webContents.openDevTools();

		});

	}

	// Emitted when the window is closed.
	mainWindow.on("closed", () => {

		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;

	});

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);


// Quit when all windows are closed.
app.on("window-all-closed", () => {

	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== "darwin")
		app.quit();

});


app.on("activate", () => {

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null)
		createWindow();


});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


let masterTrack: AudioBuffer | null = null;

ipcMain.on("trackAddition",
	async(event, windowSize, windowOverlap, gamma, epsilon) => {

		const [audioPath] = await dialog.showOpenDialog(mainWindow as any, {
			properties: ["openFile"],
			filters: [{name: "Audio Files", extensions: ["mp3", "wav"]}],
		}) as unknown as string[] || [null];

		if (!audioPath) return;

		event.sender.send("fileSelect", audioPath);

		if (!masterTrack) {

			masterTrack = await decode(audioPath);
			event.sender.send("masterAddition", masterTrack.sampleRate);

			return;

		}

		try {

			const newTrack = await decode(audioPath);
			const alignmentData = soundAlign(
				masterTrack, newTrack, windowSize, windowOverlap, gamma, epsilon
			);

			event.sender.send("trackAlignment", alignmentData);


		} catch (error) {

			event.sender.send("alignmentFailure", error.message);

		}

	});

ipcMain.on("masterTrackReset", () => (masterTrack = null));
