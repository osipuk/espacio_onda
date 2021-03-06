const electron = require('electron');
const {app, BrowserWindow, Menu, dialog  } = require('electron');
const path = require('path');
const url = require('url')
const { autoUpdater } = require('electron-updater');
const { info } = require('console');

let pluginName;
switch (process.platform) {
	case 'win32':
		pluginName = 'flash/pepflashplayer64_32_0_0_293.dll'
		break;
	case 'darwin':
		pluginName = 'flash/PepperFlashPlayer.plugin';
		break;
	case 'linux':
		pluginName = 'flash/libpepflashplayer.so';
		break;
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, '/../', pluginName));
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.293')

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
		  {  label: "dev",role: 'toggledevtools' },
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
			showInfoLicencia();
		   
		  }      
		}
	   ]
	}
  ]

  function showInfoLicencia() {
	let child = new BrowserWindow({ 
		parent: win, 
		modal: true, 
		show: false,
		title: 'Info Licencia',
		icon: __dirname + '/Material Icons_e2bd_256.png'
	 });

	child.loadURL(url.format ({
		pathname: path.join(__dirname, 'license.html'),
		protocol: 'file:',
		slashes: true
	}));
	child.once('ready-to-show', () => {
	  child.show();
	  child.removeMenu();
	})
  }
 
  
function createWindow() {	
	const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;	
	win = new BrowserWindow({
			title: 'Navegador Espacio Onda',
			width: width, height: height,
			icon: __dirname + '/icon.png',			
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



};

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