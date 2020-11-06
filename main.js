const electron = require('electron');
const {app, BrowserWindow, Menu, dialog  } = require('electron');

const path = require('path')
// const url = require('url')
const { autoUpdater } = require('electron-updater');
// require('update-electron-app')();
let pluginName


switch (process.platform) {
	case 'win32':
		pluginName = 'flash/pepflashplayer.dll'
		break;
	case 'darwin':
		pluginName = 'flash/PepperFlashPlayer.plugin';
		break;
	case 'linux':
		pluginName = 'flash/libpepflashplayer.so';
		break;
}

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/../', pluginName));
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.445')

let win;
const menuTemplate = [
	{
	   label: 'Inicio',
	   submenu: [
		  {
			label: "Salir",
			 role: 'quit'
		  },       
		  {
			 type: 'separator'
		  },
		  {
			 label: 'Versión '+app.getVersion()+''
		  }
	   ]
	},  
	{
	   label: 'Vista',
	   submenu: [
		  {
			label: "Recarga",
			 role: 'reload'
		  },
		//   {  label: "dev",role: 'toggledevtools' },
		  { type: 'separator' },
		  {
			label: "Tamaño original",
			 role: 'resetzoom'
		  },
		  {
			label: "Aumentar",
			 role: 'zoomin'
		  },
		  {
			label: "Reducir",
			 role: 'zoomout'
		  }
	   ]
	},
	
	 
	{
	  label : "Ventana",
	  submenu: [
		 {
		   label : "Pantalla completa",
		   role: 'togglefullscreen'
		 },
		 {
		   label : "Minimizar",
		   role: 'minimize'
		 },
		 {
		   label : "Restaurar",
		   role: 'zoom'
		 },
		 {
		   label : "Cerrar",
		   role: 'close'
		 }
	  ]
   },
	{
	   label : "Ayuda",     
	   submenu: [
		{
		  label: 'Ayuda de Espacio Onda',
		  click: async () => {
			const { shell } = require('electron')
			await shell.openExternal('https://editorial.ondaeduca.com/page/soporte')
		  }
		},
		{
		  label: 'Soporte técnico',
		  click: async () => {
			const { shell } = require('electron')
			await shell.openExternal('https://editorial.ondaeduca.com/page/contactus')
		  }
		},{
		  label: 'Info Licencia',
		  click :   () => {
			showAbout();
		   
		  }      
		}
	   ]
	}
  ]
  function showAbout() {
	dialog.showMessageBox({
	 title: `Info Licencia`,
	 message: `esta es la información de la licencia!`,
	 buttons: []
	});
   }
  
function createWindow() {	
	const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize	
	// Create the browser window.
	win = new BrowserWindow({
			title: 'Espacio Onda',
			width: width, height: height,
			icon: __dirname + '/Material Icons_e2bd_256.png',			
			webPreferences: {
				nodeIntegration: true,
				webSecurity: false,
				allowDisplayingInsecureContent: true,
				allowRunningInsecureContent: true,
				plugins: true
		}
  	});
  
  	win.loadURL('https://espacioonda.ondaeduca.com');	
	
	const menu = Menu.buildFromTemplate(menuTemplate);
  	Menu.setApplicationMenu(menu);
  	//win.webContents.openDevTools();

	const ses = win.webContents.session
	ses.clearCache(function() {});

	win.maximize();

	// Emitted when the window is closed.
	win.on('closed', () => {		
		win = null;
  });
  
  win.once('ready-to-show', () => {
	autoUpdater.checkForUpdatesAndNotify();
  });



}
;
autoUpdater.on('update-available', (e) => {
  console.error("update-available.."+e)
  dialog.showMessageBox(win, {
	type: 'info',
    buttons: ["Cerrar"],
    message: "Hay una nueva actualización disponible. Descargando ahora ..."
  })

});
autoUpdater.on('update-downloaded', () => {
  let response = dialog.showMessageBox(win, {
    buttons: ["Reiniciar","Cerrar"],
    message: "Actualización descargada. Se instalará al reiniciar. ¿Reiniciar ahora?"
  },(res, checked) => {
    if (res === 0){
      autoUpdater.quitAndInstall();      
    }else if (res === 1) {
     //No button pressed
    }else if (res === 2){
      console.log("restart cancelled!")
    }
   })
  
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
	const dialogOpts = {
	  type: 'info',
	  buttons: ['Restart', 'Later'],
	  title: 'Application Update',
	  message: process.platform === 'win32' ? releaseNotes : releaseName,
	  detail: 'A new version has been downloaded. Restart the application to apply the updates.'
	}
  
	dialog.showMessageBox(dialogOpts).then((returnValue) => {
	  if (returnValue.response === 0) autoUpdater.quitAndInstall()
	})
  })

  autoUpdater.on('error', message => {
	console.error('There was a problem updating the application')
	console.error(message)
  })

app.on('ready', () => {	
	createWindow();	
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {	
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});




