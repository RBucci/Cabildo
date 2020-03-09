(function(){
	var script = {
 "mouseWheelEnabled": true,
 "borderRadius": 0,
 "class": "Player",
 "scrollBarWidth": 10,
 "id": "rootPlayer",
 "vrPolyfillScale": 0.65,
 "width": "100%",
 "scripts": {
  "setMapLocation": function(panoramaPlayListItem, mapPlayer){  var resetFunction = function(){ panoramaPlayListItem.unbind('stop', resetFunction, this); player.set('mapPlayer', null); }; panoramaPlayListItem.bind('stop', resetFunction, this); var player = panoramaPlayListItem.get('player'); player.set('mapPlayer', mapPlayer); },
  "pauseCurrentPlayers": function(onlyPauseCameraIfPanorama){  var players = this.getCurrentPlayers(); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('state') == 'playing') { if(onlyPauseCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.pauseCamera(); } else { player.pause(); } } else { players.splice(i, 1); } } return players; },
  "getPlayListItemByMedia": function(playList, media){  var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media) return item; } return undefined; },
  "setMainMediaByIndex": function(index){  var item = undefined; if(index >= 0 && index < this.mainPlayList.get('items').length){ this.mainPlayList.set('selectedIndex', index); item = this.mainPlayList.get('items')[index]; } return item; },
  "cloneCamera": function(camera){  var newCamera = this.rootPlayer.createInstance(camera.get('class')); newCamera.set('id', camera.get('id') + '_copy'); newCamera.set('idleSequence', camera.get('initialSequence')); return newCamera; },
  "pauseGlobalAudiosWhilePlayItem": function(playList, index, exclude){  var self = this; var item = playList.get('items')[index]; var media = item.get('media'); var player = item.get('player'); var caller = media.get('id'); var endFunc = function(){ if(playList.get('selectedIndex') != index) { if(hasState){ player.unbind('stateChange', stateChangeFunc, self); } self.resumeGlobalAudios(caller); } }; var stateChangeFunc = function(event){ var state = event.data.state; if(state == 'stopped'){ this.resumeGlobalAudios(caller); } else if(state == 'playing'){ this.pauseGlobalAudios(caller, exclude); } }; var mediaClass = media.get('class'); var hasState = mediaClass == 'Video360' || mediaClass == 'Video'; if(hasState){ player.bind('stateChange', stateChangeFunc, this); } this.pauseGlobalAudios(caller, exclude); this.executeFunctionWhenChange(playList, index, endFunc, endFunc); },
  "stopAndGoCamera": function(camera, ms){  var sequence = camera.get('initialSequence'); sequence.pause(); var timeoutFunction = function(){ sequence.play(); }; setTimeout(timeoutFunction, ms); },
  "setMainMediaByName": function(name){  var items = this.mainPlayList.get('items'); for(var i = 0; i<items.length; ++i){ var item = items[i]; if(item.get('media').get('label') == name) { this.mainPlayList.set('selectedIndex', i); return item; } } },
  "historyGoBack": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.back(); } },
  "pauseGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ var audioData = audios[audio.get('id')]; if(audioData) audio = audioData.audio; } if(audio.get('state') == 'playing') audio.pause(); },
  "syncPlaylists": function(playLists){  var changeToMedia = function(media, playListDispatched){ for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(playList != playListDispatched){ var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ if(items[j].get('media') == media){ if(playList.get('selectedIndex') != j){ playList.set('selectedIndex', j); } break; } } } } }; var changeFunction = function(event){ var playListDispatched = event.source; var selectedIndex = playListDispatched.get('selectedIndex'); if(selectedIndex < 0) return; var media = playListDispatched.get('items')[selectedIndex].get('media'); changeToMedia(media, playListDispatched); }; var mapPlayerChangeFunction = function(event){ var panoramaMapLocation = event.source.get('panoramaMapLocation'); if(panoramaMapLocation){ var map = panoramaMapLocation.get('map'); changeToMedia(map); } }; for(var i = 0, count = playLists.length; i<count; ++i){ playLists[i].bind('change', changeFunction, this); } var mapPlayers = this.getByClassName('MapPlayer'); for(var i = 0, count = mapPlayers.length; i<count; ++i){ mapPlayers[i].bind('panoramaMapLocation_change', mapPlayerChangeFunction, this); } },
  "openLink": function(url, name){  if(url == location.href) { return; } var isElectron = (window && window.process && window.process.versions && window.process.versions['electron']) || (navigator && navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0); if (name == '_blank' && isElectron) { if (url.startsWith('/')) { var r = window.location.href.split('/'); r.pop(); url = r.join('/') + url; } var extension = url.split('.').pop().toLowerCase(); if(extension != 'pdf' || url.startsWith('file://')) { var shell = window.require('electron').shell; shell.openExternal(url); } else { window.open(url, name); } } else if(isElectron && (name == '_top' || name == '_self')) { window.location = url; } else { var newWindow = window.open(url, name); newWindow.focus(); } },
  "getMediaFromPlayer": function(player){  switch(player.get('class')){ case 'PanoramaPlayer': return player.get('panorama') || player.get('video'); case 'VideoPlayer': case 'Video360Player': return player.get('video'); case 'PhotoAlbumPlayer': return player.get('photoAlbum'); case 'MapPlayer': return player.get('map'); } },
  "setMediaBehaviour": function(playList, index, mediaDispatcher){  var self = this; var stateChangeFunction = function(event){ if(event.data.state == 'stopped'){ dispose.call(this, true); } }; var onBeginFunction = function() { item.unbind('begin', onBeginFunction, self); var media = item.get('media'); if(media.get('class') != 'Panorama' || (media.get('camera') != undefined && media.get('camera').get('initialSequence') != undefined)){ player.bind('stateChange', stateChangeFunction, self); } }; var changeFunction = function(){ var index = playListDispatcher.get('selectedIndex'); if(index != -1){ indexDispatcher = index; dispose.call(this, false); } }; var disposeCallback = function(){ dispose.call(this, false); }; var dispose = function(forceDispose){ if(!playListDispatcher) return; var media = item.get('media'); if((media.get('class') == 'Video360' || media.get('class') == 'Video') && media.get('loop') == true && !forceDispose) return; playList.set('selectedIndex', -1); if(panoramaSequence && panoramaSequenceIndex != -1){ if(panoramaSequence) { if(panoramaSequenceIndex > 0 && panoramaSequence.get('movements')[panoramaSequenceIndex-1].get('class') == 'TargetPanoramaCameraMovement'){ var initialPosition = camera.get('initialPosition'); var oldYaw = initialPosition.get('yaw'); var oldPitch = initialPosition.get('pitch'); var oldHfov = initialPosition.get('hfov'); var previousMovement = panoramaSequence.get('movements')[panoramaSequenceIndex-1]; initialPosition.set('yaw', previousMovement.get('targetYaw')); initialPosition.set('pitch', previousMovement.get('targetPitch')); initialPosition.set('hfov', previousMovement.get('targetHfov')); var restoreInitialPositionFunction = function(event){ initialPosition.set('yaw', oldYaw); initialPosition.set('pitch', oldPitch); initialPosition.set('hfov', oldHfov); itemDispatcher.unbind('end', restoreInitialPositionFunction, this); }; itemDispatcher.bind('end', restoreInitialPositionFunction, this); } panoramaSequence.set('movementIndex', panoramaSequenceIndex); } } if(player){ item.unbind('begin', onBeginFunction, this); player.unbind('stateChange', stateChangeFunction, this); for(var i = 0; i<buttons.length; ++i) { buttons[i].unbind('click', disposeCallback, this); } } if(sameViewerArea){ var currentMedia = this.getMediaFromPlayer(player); if(currentMedia == undefined || currentMedia == item.get('media')){ playListDispatcher.set('selectedIndex', indexDispatcher); } if(playList != playListDispatcher) playListDispatcher.unbind('change', changeFunction, this); } else{ viewerArea.set('visible', viewerVisibility); } playListDispatcher = undefined; }; if(!mediaDispatcher){ var currentIndex = playList.get('selectedIndex'); var currentPlayer = (currentIndex != -1) ? playList.get('items')[playList.get('selectedIndex')].get('player') : this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer) { mediaDispatcher = this.getMediaFromPlayer(currentPlayer); } } var playListDispatcher = undefined; if(mediaDispatcher){ var playListsWithMedia = this.getPlayListsWithMedia(mediaDispatcher, true); playListDispatcher = playListsWithMedia.indexOf(playList) != -1 ? playList : (playListsWithMedia.length > 0 ? playListsWithMedia[0] : undefined); } if(!playListDispatcher){ playList.set('selectedIndex', index); return; } var indexDispatcher = playListDispatcher.get('selectedIndex'); if(playList.get('selectedIndex') == index || indexDispatcher == -1){ return; } var item = playList.get('items')[index]; var itemDispatcher = playListDispatcher.get('items')[indexDispatcher]; var player = item.get('player'); var viewerArea = player.get('viewerArea'); var viewerVisibility = viewerArea.get('visible'); var sameViewerArea = viewerArea == itemDispatcher.get('player').get('viewerArea'); if(sameViewerArea){ if(playList != playListDispatcher){ playListDispatcher.set('selectedIndex', -1); playListDispatcher.bind('change', changeFunction, this); } } else{ viewerArea.set('visible', true); } var panoramaSequenceIndex = -1; var panoramaSequence = undefined; var camera = itemDispatcher.get('camera'); if(camera){ panoramaSequence = camera.get('initialSequence'); if(panoramaSequence) { panoramaSequenceIndex = panoramaSequence.get('movementIndex'); } } playList.set('selectedIndex', index); var buttons = []; var addButtons = function(property){ var value = player.get(property); if(value == undefined) return; if(Array.isArray(value)) buttons = buttons.concat(value); else buttons.push(value); }; addButtons('buttonStop'); for(var i = 0; i<buttons.length; ++i) { buttons[i].bind('click', disposeCallback, this); } item.bind('begin', onBeginFunction, self); this.executeFunctionWhenChange(playList, index, disposeCallback);  },
  "pauseGlobalAudios": function(caller, exclude){  if (window.pauseGlobalAudiosState == undefined) window.pauseGlobalAudiosState = {}; if (window.pauseGlobalAudiosList == undefined) window.pauseGlobalAudiosList = []; if (caller in window.pauseGlobalAudiosState) { return; } var audios = this.getByClassName('Audio').concat(this.getByClassName('VideoPanoramaOverlay')); if (window.currentGlobalAudios != undefined) audios = audios.concat(Object.values(window.currentGlobalAudios).map(function(v) { return v.audio })); var audiosPaused = []; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = 0; j<objAudios.length; ++j) { var a = objAudios[j]; if(audiosPaused.indexOf(a) == -1) audiosPaused.push(a); } } window.pauseGlobalAudiosState[caller] = audiosPaused; for (var i = 0, count = audios.length; i < count; ++i) { var a = audios[i]; if (a.get('state') == 'playing' && (exclude == undefined || exclude.indexOf(a) == -1)) { a.pause(); audiosPaused.push(a); } } },
  "getMediaWidth": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxW=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('width') > maxW) maxW = r.get('width'); } return maxW; }else{ return r.get('width') } default: return media.get('width'); } },
  "setOverlayBehaviour": function(overlay, media, action, preventDoubleClick){  var executeFunc = function() { switch(action){ case 'triggerClick': this.triggerOverlay(overlay, 'click'); break; case 'stop': case 'play': case 'pause': overlay[action](); break; case 'togglePlayPause': case 'togglePlayStop': if(overlay.get('state') == 'playing') overlay[action == 'togglePlayPause' ? 'pause' : 'stop'](); else overlay.play(); break; } if(preventDoubleClick){ if(window.overlaysDispatched == undefined) window.overlaysDispatched = {}; var id = overlay.get('id'); window.overlaysDispatched[id] = true; setTimeout(function(){ delete window.overlaysDispatched[id]; }, 1000); } }; if(preventDoubleClick && window.overlaysDispatched != undefined && overlay.get('id') in window.overlaysDispatched) return; var playList = this.getFirstPlayListWithMedia(media, true); if(playList != undefined){ var item = this.getPlayListItemByMedia(playList, media); if(playList.get('items').indexOf(item) != playList.get('selectedIndex')){ var beginFunc = function(e){ item.unbind('begin', beginFunc, this); executeFunc.call(this); }; item.bind('begin', beginFunc, this); return; } } executeFunc.call(this); },
  "historyGoForward": function(playList){  var history = this.get('data')['history'][playList.get('id')]; if(history != undefined) { history.forward(); } },
  "executeFunctionWhenChange": function(playList, index, endFunction, changeFunction){  var endObject = undefined; var changePlayListFunction = function(event){ if(event.data.previousSelectedIndex == index){ if(changeFunction) changeFunction.call(this); if(endFunction && endObject) endObject.unbind('end', endFunction, this); playList.unbind('change', changePlayListFunction, this); } }; if(endFunction){ var playListItem = playList.get('items')[index]; if(playListItem.get('class') == 'PanoramaPlayListItem'){ var camera = playListItem.get('camera'); if(camera != undefined) endObject = camera.get('initialSequence'); if(endObject == undefined) endObject = camera.get('idleSequence'); } else{ endObject = playListItem.get('media'); } if(endObject){ endObject.bind('end', endFunction, this); } } playList.bind('change', changePlayListFunction, this); },
  "updateMediaLabelFromPlayList": function(playList, htmlText, playListItemStopToDispose){  var changeFunction = function(){ var index = playList.get('selectedIndex'); if(index >= 0){ var beginFunction = function(){ playListItem.unbind('begin', beginFunction); setMediaLabel(index); }; var setMediaLabel = function(index){ var media = playListItem.get('media'); var text = media.get('data'); if(!text) text = media.get('label'); setHtml(text); }; var setHtml = function(text){ if(text !== undefined) { htmlText.set('html', '<div style=\"text-align:left\"><SPAN STYLE=\"color:#FFFFFF;font-size:12px;font-family:Verdana\"><span color=\"white\" font-family=\"Verdana\" font-size=\"12px\">' + text + '</SPAN></div>'); } else { htmlText.set('html', ''); } }; var playListItem = playList.get('items')[index]; if(htmlText.get('html')){ setHtml('Loading...'); playListItem.bind('begin', beginFunction); } else{ setMediaLabel(index); } } }; var disposeFunction = function(){ htmlText.set('html', undefined); playList.unbind('change', changeFunction, this); playListItemStopToDispose.unbind('stop', disposeFunction, this); }; if(playListItemStopToDispose){ playListItemStopToDispose.bind('stop', disposeFunction, this); } playList.bind('change', changeFunction, this); changeFunction(); },
  "triggerOverlay": function(overlay, eventName){  if(overlay.get('areas') != undefined) { var areas = overlay.get('areas'); for(var i = 0; i<areas.length; ++i) { areas[i].trigger(eventName); } } else { overlay.trigger(eventName); } },
  "setPanoramaCameraWithCurrentSpot": function(playListItem){  var currentPlayer = this.getActivePlayerWithViewer(this.MainViewer); if(currentPlayer == undefined){ return; } var playerClass = currentPlayer.get('class'); if(playerClass != 'PanoramaPlayer' && playerClass != 'Video360Player'){ return; } var fromMedia = currentPlayer.get('panorama'); if(fromMedia == undefined) { fromMedia = currentPlayer.get('video'); } var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, fromMedia); this.startPanoramaWithCamera(panorama, newCamera); },
  "playAudioList": function(audios){  if(audios.length == 0) return; var currentAudioCount = -1; var currentAudio; var playGlobalAudioFunction = this.playGlobalAudio; var playNext = function(){ if(++currentAudioCount >= audios.length) currentAudioCount = 0; currentAudio = audios[currentAudioCount]; playGlobalAudioFunction(currentAudio, playNext, true); }; playNext(); },
  "playGlobalAudioWhilePlay": function(playList, index, audio, endCallback, stopBackgroundAudio){  var changeFunction = function(event){ if(event.data.previousSelectedIndex == index){ this.stopGlobalAudio(audio); if(isPanorama) { var media = playListItem.get('media'); var audios = media.get('audios'); audios.splice(audios.indexOf(audio), 1); media.set('audios', audios); } playList.unbind('change', changeFunction, this); if(endCallback) endCallback(); } }; var audios = window.currentGlobalAudios; if(audios && audio.get('id') in audios){ audio = audios[audio.get('id')].audio; if(audio.get('state') != 'playing'){ audio.play(); } return audio; } playList.bind('change', changeFunction, this); var playListItem = playList.get('items')[index]; var isPanorama = playListItem.get('class') == 'PanoramaPlayListItem'; if(isPanorama) { var media = playListItem.get('media'); var audios = (media.get('audios') || []).slice(); if(audio.get('class') == 'MediaAudio') { var panoramaAudio = this.rootPlayer.createInstance('PanoramaAudio'); panoramaAudio.set('autoplay', false); panoramaAudio.set('audio', audio.get('audio')); panoramaAudio.set('loop', audio.get('loop')); panoramaAudio.set('id', audio.get('id')); var stateChangeFunctions = audio.getBindings('stateChange'); for(var i = 0; i<stateChangeFunctions.length; ++i){ var f = stateChangeFunctions[i]; if(typeof f == 'string') f = new Function('event', f); panoramaAudio.bind('stateChange', f, this); } audio = panoramaAudio; } audios.push(audio); media.set('audios', audios); } var src = this.playGlobalAudio(audio, endCallback); if(stopBackgroundAudio === true){ var stateChangeFunc = function(){ if(src.get('state') == 'playing'){ this.pauseGlobalAudios(src.get('id'), [src]); } else { this.resumeGlobalAudios(src.get('id')); src.unbind('stateChange', stateChangeFunc, this); } }; src.bind('stateChange', stateChangeFunc, this); } return src; },
  "getMediaHeight": function(media){  switch(media.get('class')){ case 'Video360': var res = media.get('video'); if(res instanceof Array){ var maxH=0; for(var i=0; i<res.length; i++){ var r = res[i]; if(r.get('height') > maxH) maxH = r.get('height'); } return maxH; }else{ return r.get('height') } default: return media.get('height'); } },
  "setPanoramaCameraWithSpot": function(playListItem, yaw, pitch){  var panorama = playListItem.get('media'); var newCamera = this.cloneCamera(playListItem.get('camera')); var initialPosition = newCamera.get('initialPosition'); initialPosition.set('yaw', yaw); initialPosition.set('pitch', pitch); this.startPanoramaWithCamera(panorama, newCamera); },
  "playGlobalAudio": function(audio, endCallback, asBackground){  var endFunction = function(){ audio.unbind('end', endFunction, this); this.stopGlobalAudio(audio); if(endCallback) endCallback(); }; audio = this.getGlobalAudio(audio); var audios = window.currentGlobalAudios; if(!audios){ audios = window.currentGlobalAudios = {}; } audios[audio.get('id')] = {'audio': audio, 'asBackground': asBackground || false}; if(audio.get('state') == 'playing'){ return audio; } if(!audio.get('loop')){ audio.bind('end', endFunction, this); } audio.play(); return audio; },
  "getPixels": function(value){  var result = new RegExp('((\\+|\\-)?\\d+(\\.\\d*)?)(px|vw|vh|vmin|vmax)?', 'i').exec(value); if (result == undefined) { return 0; } var num = parseFloat(result[1]); var unit = result[4]; var vw = this.rootPlayer.get('actualWidth') / 100; var vh = this.rootPlayer.get('actualHeight') / 100; switch(unit) { case 'vw': return num * vw; case 'vh': return num * vh; case 'vmin': return num * Math.min(vw, vh); case 'vmax': return num * Math.max(vw, vh); default: return num; } },
  "fixTogglePlayPauseButton": function(player){  var state = player.get('state'); var buttons = player.get('buttonPlayPause'); if(typeof buttons !== 'undefined' && player.get('state') == 'playing'){ if(!Array.isArray(buttons)) buttons = [buttons]; for(var i = 0; i<buttons.length; ++i) buttons[i].set('pressed', true); } },
  "initGA": function(){  var sendFunc = function(category, event, label) { ga('send', 'event', category, event, label); }; var media = this.getByClassName('Panorama'); media = media.concat(this.getByClassName('Video360')); media = media.concat(this.getByClassName('Map')); for(var i = 0, countI = media.length; i<countI; ++i){ var m = media[i]; var mediaLabel = m.get('label'); var overlays = this.getOverlays(m); for(var j = 0, countJ = overlays.length; j<countJ; ++j){ var overlay = overlays[j]; var overlayLabel = overlay.get('data') != undefined ? mediaLabel + ' - ' + overlay.get('data')['label'] : mediaLabel; switch(overlay.get('class')) { case 'HotspotPanoramaOverlay': case 'HotspotMapOverlay': var areas = overlay.get('areas'); for (var z = 0; z<areas.length; ++z) { areas[z].bind('click', sendFunc.bind(this, 'Hotspot', 'click', overlayLabel), this); } break; case 'CeilingCapPanoramaOverlay': case 'TripodCapPanoramaOverlay': overlay.bind('click', sendFunc.bind(this, 'Cap', 'click', overlayLabel), this); break; } } } var components = this.getByClassName('Button'); components = components.concat(this.getByClassName('IconButton')); for(var i = 0, countI = components.length; i<countI; ++i){ var c = components[i]; var componentLabel = c.get('data')['name']; c.bind('click', sendFunc.bind(this, 'Skin', 'click', componentLabel), this); } var items = this.getByClassName('PlayListItem'); var media2Item = {}; for(var i = 0, countI = items.length; i<countI; ++i) { var item = items[i]; var media = item.get('media'); if(!(media.get('id') in media2Item)) { item.bind('begin', sendFunc.bind(this, 'Media', 'play', media.get('label')), this); media2Item[media.get('id')] = item; } } },
  "updateVideoCues": function(playList, index){  var playListItem = playList.get('items')[index]; var video = playListItem.get('media'); if(video.get('cues').length == 0) return; var player = playListItem.get('player'); var cues = []; var changeFunction = function(){ if(playList.get('selectedIndex') != index){ video.unbind('cueChange', cueChangeFunction, this); playList.unbind('change', changeFunction, this); } }; var cueChangeFunction = function(event){ var activeCues = event.data.activeCues; for(var i = 0, count = cues.length; i<count; ++i){ var cue = cues[i]; if(activeCues.indexOf(cue) == -1 && (cue.get('startTime') > player.get('currentTime') || cue.get('endTime') < player.get('currentTime')+0.5)){ cue.trigger('end'); } } cues = activeCues; }; video.bind('cueChange', cueChangeFunction, this); playList.bind('change', changeFunction, this); },
  "getComponentByName": function(name){  var list = this.getByClassName('UIComponent'); for(var i = 0, count = list.length; i<count; ++i){ var component = list[i]; var data = component.get('data'); if(data != undefined && data.name == name){ return component; } } return undefined; },
  "getActivePlayerWithViewer": function(viewerArea){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); players = players.concat(this.getByClassName('MapPlayer')); var i = players.length; while(i-- > 0){ var player = players[i]; if(player.get('viewerArea') == viewerArea) { var playerClass = player.get('class'); if(playerClass == 'PanoramaPlayer' && (player.get('panorama') != undefined || player.get('video') != undefined)) return player; else if((playerClass == 'VideoPlayer' || playerClass == 'Video360Player') && player.get('video') != undefined) return player; else if(playerClass == 'PhotoAlbumPlayer' && player.get('photoAlbum') != undefined) return player; else if(playerClass == 'MapPlayer' && player.get('map') != undefined) return player; } } return undefined; },
  "visibleComponentsIfPlayerFlagEnabled": function(components, playerFlag){  var enabled = this.get(playerFlag); for(var i in components){ components[i].set('visible', enabled); } },
  "registerTextVariable": function(obj){  var property = (function() { switch (obj.get('class')) { case 'Label': return 'text'; case 'Button': case 'BaseButton': return 'label'; case 'HTMLText': return 'html'; } })(); if (property == undefined) return; var re = new RegExp('\\{\\{\\s*(\\w+)\\s*\\}\\}', 'g'); var text = obj.get(property); var data = obj.get('data') || {}; data[property] = text; obj.set('data', data); var updateLabel = function(vars) { var text = data[property]; for (var i = 0; i < vars.length; ++i) { var info = vars[i]; var dispatchers = info.dispatchers; for (var j = 0; j < dispatchers.length; ++j) { var dispatcher = dispatchers[j]; var index = dispatcher.get('selectedIndex'); if (index >= 0) { var srcPropArray = info.src.split('.'); var src = dispatcher.get('items')[index]; if(src == undefined || (info.itemCondition !== undefined && !info.itemCondition.call(this, src))) continue; for (var z = 0; z < srcPropArray.length; ++z) src = 'get' in src ? src.get(srcPropArray[z]) : src[srcPropArray[z]]; text = text.replace(info.replace, src); } } } if(text != data[property]) obj.set(property, text); }; var vars = []; var addVars = function(dispatchers, eventName, src, replace, itemCondition) { vars.push({ 'dispatchers': dispatchers, 'eventName': eventName, 'src': src, 'replace': replace, 'itemCondition': itemCondition }); }; var viewerAreaItemCondition = function(item) { var player = item.get('player'); return player !== undefined && player.get('viewerArea') == this.MainViewer; }; while (null != (result = re.exec(text))) { switch (result[1]) { case 'title': var playLists = this._getPlayListsWithViewer(this.MainViewer); addVars(playLists, 'change', 'media.label', result[0], viewerAreaItemCondition); break; case 'subtitle': var playLists = this._getPlayListsWithViewer(this.MainViewer); addVars(playLists, 'change', 'media.data.subtitle', result[0], viewerAreaItemCondition); break; } } if (vars.length > 0) { var func = updateLabel.bind(this, vars); for (var i = 0; i < vars.length; ++i) { var info = vars[i]; var dispatchers = info.dispatchers; for (var j = 0; j < dispatchers.length; ++j) dispatchers[j].bind(info.eventName, func, this); } } },
  "setStartTimeVideoSync": function(video, player){  this.setStartTimeVideo(video, player.get('currentTime')); },
  "init": function(){  if(!Object.hasOwnProperty('values')) { Object.values = function(o){ return Object.keys(o).map(function(e) { return o[e]; }); }; } var history = this.get('data')['history']; var playListChangeFunc = function(e){ var playList = e.source; var index = playList.get('selectedIndex'); if(index < 0) return; var id = playList.get('id'); if(!history.hasOwnProperty(id)) history[id] = new HistoryData(playList); history[id].add(index); }; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i) { var playList = playLists[i]; playList.bind('change', playListChangeFunc, this); } },
  "setStartTimeVideo": function(video, time){  var items = this.getPlayListItems(video); var startTimeBackup = []; var restoreStartTimeFunc = function() { for(var i = 0; i<items.length; ++i){ var item = items[i]; item.set('startTime', startTimeBackup[i]); item.unbind('stop', restoreStartTimeFunc, this); } }; for(var i = 0; i<items.length; ++i) { var item = items[i]; var player = item.get('player'); if(player.get('video') == video && player.get('state') == 'playing') { player.seek(time); } else { startTimeBackup.push(item.get('startTime')); item.set('startTime', time); item.bind('stop', restoreStartTimeFunc, this); } } },
  "registerKey": function(key, value){  window[key] = value; },
  "isCardboardViewMode": function(){  var players = this.getByClassName('PanoramaPlayer'); return players.length > 0 && players[0].get('viewMode') == 'cardboard'; },
  "getPanoramaOverlayByName": function(panorama, name){  var overlays = this.getOverlays(panorama); for(var i = 0, count = overlays.length; i<count; ++i){ var overlay = overlays[i]; var data = overlay.get('data'); if(data != undefined && data.label == name){ return overlay; } } return undefined; },
  "getCurrentPlayerWithMedia": function(media){  var playerClass = undefined; var mediaPropertyName = undefined; switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'panorama'; break; case 'Video360': playerClass = 'PanoramaPlayer'; mediaPropertyName = 'video'; break; case 'PhotoAlbum': playerClass = 'PhotoAlbumPlayer'; mediaPropertyName = 'photoAlbum'; break; case 'Map': playerClass = 'MapPlayer'; mediaPropertyName = 'map'; break; case 'Video': playerClass = 'VideoPlayer'; mediaPropertyName = 'video'; break; }; if(playerClass != undefined) { var players = this.getByClassName(playerClass); for(var i = 0; i<players.length; ++i){ var player = players[i]; if(player.get(mediaPropertyName) == media) { return player; } } } else { return undefined; } },
  "getOverlays": function(media){  switch(media.get('class')){ case 'Panorama': var overlays = media.get('overlays').concat() || []; var frames = media.get('frames'); for(var j = 0; j<frames.length; ++j){ overlays = overlays.concat(frames[j].get('overlays') || []); } return overlays; case 'Video360': case 'Map': return media.get('overlays') || []; default: return []; } },
  "unregisterKey": function(key){  delete window[key]; },
  "showComponentsWhileMouseOver": function(parentComponent, components, durationVisibleWhileOut){  var setVisibility = function(visible){ for(var i = 0, length = components.length; i<length; i++){ var component = components[i]; if(component.get('class') == 'HTMLText' && (component.get('html') == '' || component.get('html') == undefined)) { continue; } component.set('visible', visible); } }; if (this.rootPlayer.get('touchDevice') == true){ setVisibility(true); } else { var timeoutID = -1; var rollOverFunction = function(){ setVisibility(true); if(timeoutID >= 0) clearTimeout(timeoutID); parentComponent.unbind('rollOver', rollOverFunction, this); parentComponent.bind('rollOut', rollOutFunction, this); }; var rollOutFunction = function(){ var timeoutFunction = function(){ setVisibility(false); parentComponent.unbind('rollOver', rollOverFunction, this); }; parentComponent.unbind('rollOut', rollOutFunction, this); parentComponent.bind('rollOver', rollOverFunction, this); timeoutID = setTimeout(timeoutFunction, durationVisibleWhileOut); }; parentComponent.bind('rollOver', rollOverFunction, this); } },
  "resumePlayers": function(players, onlyResumeCameraIfPanorama){  for(var i = 0; i<players.length; ++i){ var player = players[i]; if(onlyResumeCameraIfPanorama && player.get('class') == 'PanoramaPlayer' && typeof player.get('video') === 'undefined'){ player.resumeCamera(); } else{ player.play(); } } },
  "getCurrentPlayers": function(){  var players = this.getByClassName('PanoramaPlayer'); players = players.concat(this.getByClassName('VideoPlayer')); players = players.concat(this.getByClassName('Video360Player')); players = players.concat(this.getByClassName('PhotoAlbumPlayer')); return players; },
  "resumeGlobalAudios": function(caller){  if (window.pauseGlobalAudiosState == undefined || !(caller in window.pauseGlobalAudiosState)) return; var audiosPaused = window.pauseGlobalAudiosState[caller]; delete window.pauseGlobalAudiosState[caller]; var values = Object.values(window.pauseGlobalAudiosState); for (var i = 0, count = values.length; i<count; ++i) { var objAudios = values[i]; for (var j = audiosPaused.length-1; j>=0; --j) { var a = audiosPaused[j]; if(objAudios.indexOf(a) != -1) audiosPaused.splice(j, 1); } } for (var i = 0, count = audiosPaused.length; i<count; ++i) { var a = audiosPaused[i]; if (a.get('state') == 'paused') a.play(); } },
  "showPopupMedia": function(w, media, playList, popupMaxWidth, popupMaxHeight, autoCloseWhenFinished, stopAudios){  var self = this; var closeFunction = function(){ playList.set('selectedIndex', -1); self.MainViewer.set('toolTipEnabled', true); if(stopAudios) { self.resumeGlobalAudios(); } this.resumePlayers(playersPaused, !stopAudios); if(isVideo) { this.unbind('resize', resizeFunction, this); } w.unbind('close', closeFunction, this); }; var endFunction = function(){ w.hide(); }; var resizeFunction = function(){ var getWinValue = function(property){ return w.get(property) || 0; }; var parentWidth = self.get('actualWidth'); var parentHeight = self.get('actualHeight'); var mediaWidth = self.getMediaWidth(media); var mediaHeight = self.getMediaHeight(media); var popupMaxWidthNumber = parseFloat(popupMaxWidth) / 100; var popupMaxHeightNumber = parseFloat(popupMaxHeight) / 100; var windowWidth = popupMaxWidthNumber * parentWidth; var windowHeight = popupMaxHeightNumber * parentHeight; var footerHeight = getWinValue('footerHeight'); var headerHeight = getWinValue('headerHeight'); if(!headerHeight) { var closeButtonHeight = getWinValue('closeButtonIconHeight') + getWinValue('closeButtonPaddingTop') + getWinValue('closeButtonPaddingBottom'); var titleHeight = self.getPixels(getWinValue('titleFontSize')) + getWinValue('titlePaddingTop') + getWinValue('titlePaddingBottom'); headerHeight = closeButtonHeight > titleHeight ? closeButtonHeight : titleHeight; headerHeight += getWinValue('headerPaddingTop') + getWinValue('headerPaddingBottom'); } var contentWindowWidth = windowWidth - getWinValue('bodyPaddingLeft') - getWinValue('bodyPaddingRight') - getWinValue('paddingLeft') - getWinValue('paddingRight'); var contentWindowHeight = windowHeight - headerHeight - footerHeight - getWinValue('bodyPaddingTop') - getWinValue('bodyPaddingBottom') - getWinValue('paddingTop') - getWinValue('paddingBottom'); var parentAspectRatio = contentWindowWidth / contentWindowHeight; var mediaAspectRatio = mediaWidth / mediaHeight; if(parentAspectRatio > mediaAspectRatio) { windowWidth = contentWindowHeight * mediaAspectRatio + getWinValue('bodyPaddingLeft') + getWinValue('bodyPaddingRight') + getWinValue('paddingLeft') + getWinValue('paddingRight'); } else { windowHeight = contentWindowWidth / mediaAspectRatio + headerHeight + footerHeight + getWinValue('bodyPaddingTop') + getWinValue('bodyPaddingBottom') + getWinValue('paddingTop') + getWinValue('paddingBottom'); } if(windowWidth > parentWidth * popupMaxWidthNumber) { windowWidth = parentWidth * popupMaxWidthNumber; } if(windowHeight > parentHeight * popupMaxHeightNumber) { windowHeight = parentHeight * popupMaxHeightNumber; } w.set('width', windowWidth); w.set('height', windowHeight); w.set('x', (parentWidth - getWinValue('actualWidth')) * 0.5); w.set('y', (parentHeight - getWinValue('actualHeight')) * 0.5); }; if(autoCloseWhenFinished){ this.executeFunctionWhenChange(playList, 0, endFunction); } var mediaClass = media.get('class'); var isVideo = mediaClass == 'Video' || mediaClass == 'Video360'; playList.set('selectedIndex', 0); if(isVideo){ this.bind('resize', resizeFunction, this); resizeFunction(); playList.get('items')[0].get('player').play(); } else { w.set('width', popupMaxWidth); w.set('height', popupMaxHeight); } this.MainViewer.set('toolTipEnabled', false); if(stopAudios) { this.pauseGlobalAudios(); } var playersPaused = this.pauseCurrentPlayers(!stopAudios); w.bind('close', closeFunction, this); w.show(this, true); },
  "shareSocial": function(socialID, url, deepLink){  if(url == undefined) { url = deepLink ? location.href : location.href.split(location.search||location.hash||/[?#]/)[0]; } else if(deepLink) { url += location.hash; } url = (function(id){ switch(id){ case 'fb': return 'https://www.facebook.com/sharer/sharer.php?u='+url; case 'wa': return 'https://api.whatsapp.com/send/?text='+encodeURIComponent(url); case 'tw': return 'https://twitter.com/intent/tweet?source=webclient&url='+url; default: return undefined; } })(socialID); this.openLink(url, '_blank'); },
  "autotriggerAtStart": function(playList, callback, once){  var onChange = function(event){ callback(); if(once == true) playList.unbind('change', onChange, this); }; playList.bind('change', onChange, this); },
  "showPopupImage": function(image, toggleImage, customWidth, customHeight, showEffect, hideEffect, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedCallback, hideCallback){  var self = this; var closed = false; var playerClickFunction = function() { zoomImage.unbind('loaded', loadedFunction, self); hideFunction(); }; var clearAutoClose = function(){ zoomImage.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var resizeFunction = function(){ setTimeout(setCloseButtonPosition, 0); }; var loadedFunction = function(){ self.unbind('click', playerClickFunction, self); veil.set('visible', true); setCloseButtonPosition(); closeButton.set('visible', true); zoomImage.unbind('loaded', loadedFunction, this); zoomImage.bind('userInteractionStart', userInteractionStartFunction, this); zoomImage.bind('userInteractionEnd', userInteractionEndFunction, this); zoomImage.bind('resize', resizeFunction, this); timeoutID = setTimeout(timeoutFunction, 200); }; var timeoutFunction = function(){ timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ hideFunction(); }; zoomImage.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } zoomImage.bind('backgroundClick', hideFunction, this); if(toggleImage) { zoomImage.bind('click', toggleFunction, this); zoomImage.set('imageCursor', 'hand'); } closeButton.bind('click', hideFunction, this); if(loadedCallback) loadedCallback(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); closed = true; if(timeoutID) clearTimeout(timeoutID); if (timeoutUserInteractionID) clearTimeout(timeoutUserInteractionID); if(autoCloseMilliSeconds) clearAutoClose(); if(hideCallback) hideCallback(); zoomImage.set('visible', false); if(hideEffect && hideEffect.get('duration') > 0){ hideEffect.bind('end', endEffectFunction, this); } else{ zoomImage.set('image', null); } closeButton.set('visible', false); veil.set('visible', false); self.unbind('click', playerClickFunction, self); zoomImage.unbind('backgroundClick', hideFunction, this); zoomImage.unbind('userInteractionStart', userInteractionStartFunction, this); zoomImage.unbind('userInteractionEnd', userInteractionEndFunction, this, true); zoomImage.unbind('resize', resizeFunction, this); if(toggleImage) { zoomImage.unbind('click', toggleFunction, this); zoomImage.set('cursor', 'default'); } closeButton.unbind('click', hideFunction, this); self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } }; var endEffectFunction = function() { zoomImage.set('image', null); hideEffect.unbind('end', endEffectFunction, this); }; var toggleFunction = function() { zoomImage.set('image', isToggleVisible() ? image : toggleImage); }; var isToggleVisible = function() { return zoomImage.get('image') == toggleImage; }; var setCloseButtonPosition = function() { var right = zoomImage.get('actualWidth') - zoomImage.get('imageLeft') - zoomImage.get('imageWidth') + 10; var top = zoomImage.get('imageTop') + 10; if(right < 10) right = 10; if(top < 10) top = 10; closeButton.set('right', right); closeButton.set('top', top); }; var userInteractionStartFunction = function() { if(timeoutUserInteractionID){ clearTimeout(timeoutUserInteractionID); timeoutUserInteractionID = undefined; } else{ closeButton.set('visible', false); } }; var userInteractionEndFunction = function() { if(!closed){ timeoutUserInteractionID = setTimeout(userInteractionTimeoutFunction, 300); } }; var userInteractionTimeoutFunction = function() { timeoutUserInteractionID = undefined; closeButton.set('visible', true); setCloseButtonPosition(); }; this.MainViewer.set('toolTipEnabled', false); var veil = this.veilPopupPanorama; var zoomImage = this.zoomImagePopupPanorama; var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } var timeoutID = undefined; var timeoutUserInteractionID = undefined; zoomImage.bind('loaded', loadedFunction, this); setTimeout(function(){ self.bind('click', playerClickFunction, self, false); }, 0); zoomImage.set('image', image); zoomImage.set('customWidth', customWidth); zoomImage.set('customHeight', customHeight); zoomImage.set('showEffect', showEffect); zoomImage.set('hideEffect', hideEffect); zoomImage.set('visible', true); return zoomImage; },
  "keepCompVisible": function(component, keep){  var key = 'keepVisibility_' + component.get('id'); var value = this.getKey(key); if(value == undefined && keep) { this.registerKey(key, keep); } else if(value != undefined && !keep) { this.unregisterKey(key); } },
  "stopGlobalAudios": function(onlyForeground){  var audios = window.currentGlobalAudios; var self = this; if(audios){ Object.keys(audios).forEach(function(key){ var data = audios[key]; if(!onlyForeground || (onlyForeground && !data.asBackground)) { self.stopGlobalAudio(data.audio); } }); } },
  "existsKey": function(key){  return key in window; },
  "getGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios != undefined && audio.get('id') in audios){ audio = audios[audio.get('id')].audio; } return audio; },
  "_initItemWithComps": function(playList, index, components, eventName, visible, effectToApply, delay, restoreStateAt){  var item = playList.get('items')[index]; var registerVisibility = restoreStateAt > 0; var rootPlayer = this.rootPlayer; var cloneEffect = function(visible) { var klass = effectToApply ? effectToApply.get('class') : undefined; var effect = undefined; switch(klass) { case 'FadeInEffect': case 'FadeOutEffect': effect = rootPlayer.createInstance(visible ? 'FadeInEffect' : 'FadeOutEffect'); break; case 'SlideInEffect': case 'SlideOutEffect': effect = rootPlayer.createInstance(visible ? 'SlideInEffect' : 'SlideOutEffect'); break; } if(effect){ effect.set('duration', effectToApply.get('duration')); effect.set('easing', effectToApply.get('easing')); if(klass.indexOf('Slide') != -1) effect.set(visible ? 'from' : 'to', effectToApply.get(visible ? 'from' : 'to')); } return effect; }; var endFunc = function() { for(var i = 0, count = components.length; i<count; ++i) { var component = components[i]; if(restoreStateAt > 0){ this.setComponentVisibility(component, !visible, 0, cloneEffect(!visible)); } else { var key = 'visibility_' + component.get('id'); if(this.existsKey(key)) { if(this.getKey(key)) this.setComponentVisibility(component, true, 0, cloneEffect(true)); else this.setComponentVisibility(component, false, 0, cloneEffect(false)); this.unregisterKey(key); } } } item.unbind('end', endFunc, this); if(addMediaEndEvent) media.unbind('end', endFunc, this); }; var stopFunc = function() { item.unbind('stop', stopFunc, this, true); item.unbind('stop', stopFunc, this); item.unbind('begin', stopFunc, this, true); item.unbind('begin', stopFunc, this); for(var i = 0, count = components.length; i<count; ++i) { this.keepCompVisible(components[i], false); } }; var addEvent = function(eventName, delay, restoreStateAt){ var changeFunc = function(){ var changeVisibility = function(component, visible, effect) { rootPlayer.setComponentVisibility(component, visible, delay, effect, visible ? 'showEffect' : 'hideEffect', false); if(restoreStateAt > 0){ var time = delay + restoreStateAt + (effect != undefined ? effect.get('duration') : 0); rootPlayer.setComponentVisibility(component, !visible, time, cloneEffect(!visible), visible ? 'hideEffect' : 'showEffect', true); } }; for(var i = 0, count = components.length; i<count; ++i){ var component = components[i]; if(visible == 'toggle'){ if(!component.get('visible')) changeVisibility(component, true, cloneEffect(true)); else changeVisibility(component, false, cloneEffect(false)); } else { changeVisibility(component, visible, cloneEffect(visible)); } } item.unbind(eventName, changeFunc, this); }; item.bind(eventName, changeFunc, this) }; if(eventName == 'begin'){ for(var i = 0, count = components.length; i<count; ++i){ var component = components[i]; this.keepCompVisible(component, true); if(registerVisibility) { var key = 'visibility_' + component.get('id'); this.registerKey(key, component.get('visible')); } } item.bind('stop', stopFunc, this, true); item.bind('stop', stopFunc, this); item.bind('begin', stopFunc, this, true); item.bind('begin', stopFunc, this); if(registerVisibility){ item.bind('end', endFunc, this); var media = item.get('media'); var addMediaEndEvent = media.get('loop') != undefined && !(media.get('loop')); if(addMediaEndEvent) media.bind('end', endFunc, this); } } else if(eventName == 'end' && restoreStateAt > 0){ addEvent('begin', restoreStateAt, 0); restoreStateAt = 0; } if(eventName != undefined) addEvent(eventName, delay, restoreStateAt); },
  "stopGlobalAudio": function(audio){  var audios = window.currentGlobalAudios; if(audios){ var audioData = audios[audio.get('id')]; if(audioData){ audio = audioData.audio; delete audios[audio.get('id')]; if(Object.keys(audios).length == 0){ window.currentGlobalAudios = undefined; } } } if(audio) audio.stop(); },
  "_getPlayListsWithViewer": function(viewer){  var playLists = this.getByClassName('PlayList'); var containsViewer = function(playList) { var items = playList.get('items'); for(var j=items.length-1; j>=0; --j) { var item = items[j]; var player = item.get('player'); if(player !== undefined && player.get('viewerArea') == viewer) return true; } return false; }; for(var i=playLists.length-1; i>=0; --i) { if(!containsViewer(playLists[i])) playLists.splice(i, 1); } return playLists; },
  "getMediaByName": function(name){  var list = this.getByClassName('Media'); for(var i = 0, count = list.length; i<count; ++i){ var media = list[i]; if((media.get('class') == 'Audio' && media.get('data').label == name) || media.get('label') == name){ return media; } } return undefined; },
  "changeBackgroundWhilePlay": function(playList, index, color){  var stopFunction = function(event){ playListItem.unbind('stop', stopFunction, this); if((color == viewerArea.get('backgroundColor')) && (colorRatios == viewerArea.get('backgroundColorRatios'))){ viewerArea.set('backgroundColor', backgroundColorBackup); viewerArea.set('backgroundColorRatios', backgroundColorRatiosBackup); } }; var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var viewerArea = player.get('viewerArea'); var backgroundColorBackup = viewerArea.get('backgroundColor'); var backgroundColorRatiosBackup = viewerArea.get('backgroundColorRatios'); var colorRatios = [0]; if((color != backgroundColorBackup) || (colorRatios != backgroundColorRatiosBackup)){ viewerArea.set('backgroundColor', color); viewerArea.set('backgroundColorRatios', colorRatios); playListItem.bind('stop', stopFunction, this); } },
  "getKey": function(key){  return window[key]; },
  "showPopupPanoramaVideoOverlay": function(popupPanoramaOverlay, closeButtonProperties, stopAudios){  var self = this; var showEndFunction = function() { popupPanoramaOverlay.unbind('showEnd', showEndFunction); closeButton.bind('click', hideFunction, this); setCloseButtonPosition(); closeButton.set('visible', true); }; var endFunction = function() { if(!popupPanoramaOverlay.get('loop')) hideFunction(); }; var hideFunction = function() { self.MainViewer.set('toolTipEnabled', true); popupPanoramaOverlay.set('visible', false); closeButton.set('visible', false); closeButton.unbind('click', hideFunction, self); popupPanoramaOverlay.unbind('end', endFunction, self); popupPanoramaOverlay.unbind('hideEnd', hideFunction, self, true); self.resumePlayers(playersPaused, true); if(stopAudios) { self.resumeGlobalAudios(); } }; var setCloseButtonPosition = function() { var right = 10; var top = 10; closeButton.set('right', right); closeButton.set('top', top); }; this.MainViewer.set('toolTipEnabled', false); var closeButton = this.closeButtonPopupPanorama; if(closeButtonProperties){ for(var key in closeButtonProperties){ closeButton.set(key, closeButtonProperties[key]); } } var playersPaused = this.pauseCurrentPlayers(true); if(stopAudios) { this.pauseGlobalAudios(); } popupPanoramaOverlay.bind('end', endFunction, this, true); popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); popupPanoramaOverlay.bind('hideEnd', hideFunction, this, true); popupPanoramaOverlay.set('visible', true); },
  "getPlayListsWithMedia": function(media, onlySelected){  var result = []; var playLists = this.getByClassName('PlayList'); for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; if(onlySelected && playList.get('selectedIndex') == -1) continue; if(this.getPlayListItemByMedia(playList, media) != undefined) result.push(playList); } return result; },
  "setCameraSameSpotAsMedia": function(camera, media){  var player = this.getCurrentPlayerWithMedia(media); if(player != undefined) { var position = camera.get('initialPosition'); position.set('yaw', player.get('yaw')); position.set('pitch', player.get('pitch')); position.set('hfov', player.get('hfov')); } },
  "loadFromCurrentMediaPlayList": function(playList, delta){  var currentIndex = playList.get('selectedIndex'); var totalItems = playList.get('items').length; var newIndex = (currentIndex + delta) % totalItems; while(newIndex < 0){ newIndex = totalItems + newIndex; }; if(currentIndex != newIndex){ playList.set('selectedIndex', newIndex); } },
  "setComponentVisibility": function(component, visible, applyAt, effect, propertyEffect, ignoreClearTimeout){  var keepVisibility = this.getKey('keepVisibility_' + component.get('id')); if(keepVisibility) return; this.unregisterKey('visibility_'+component.get('id')); var changeVisibility = function(){ if(effect && propertyEffect){ component.set(propertyEffect, effect); } component.set('visible', visible); if(component.get('class') == 'ViewerArea'){ try{ if(visible) component.restart(); else if(component.get('playbackState') == 'playing') component.pause(); } catch(e){}; } }; var effectTimeoutName = 'effectTimeout_'+component.get('id'); if(!ignoreClearTimeout && window.hasOwnProperty(effectTimeoutName)){ var effectTimeout = window[effectTimeoutName]; if(effectTimeout instanceof Array){ for(var i=0; i<effectTimeout.length; i++){ clearTimeout(effectTimeout[i]) } }else{ clearTimeout(effectTimeout); } delete window[effectTimeoutName]; } else if(visible == component.get('visible') && !ignoreClearTimeout) return; if(applyAt && applyAt > 0){ var effectTimeout = setTimeout(function(){ if(window[effectTimeoutName] instanceof Array) { var arrayTimeoutVal = window[effectTimeoutName]; var index = arrayTimeoutVal.indexOf(effectTimeout); arrayTimeoutVal.splice(index, 1); if(arrayTimeoutVal.length == 0){ delete window[effectTimeoutName]; } }else{ delete window[effectTimeoutName]; } changeVisibility(); }, applyAt); if(window.hasOwnProperty(effectTimeoutName)){ window[effectTimeoutName] = [window[effectTimeoutName], effectTimeout]; }else{ window[effectTimeoutName] = effectTimeout; } } else{ changeVisibility(); } },
  "loopAlbum": function(playList, index){  var playListItem = playList.get('items')[index]; var player = playListItem.get('player'); var loopFunction = function(){ player.play(); }; this.executeFunctionWhenChange(playList, index, loopFunction); },
  "showWindow": function(w, autoCloseMilliSeconds, containsAudio){  if(w.get('visible') == true){ return; } var closeFunction = function(){ clearAutoClose(); this.resumePlayers(playersPaused, !containsAudio); w.unbind('close', closeFunction, this); }; var clearAutoClose = function(){ w.unbind('click', clearAutoClose, this); if(timeoutID != undefined){ clearTimeout(timeoutID); } }; var timeoutID = undefined; if(autoCloseMilliSeconds){ var autoCloseFunction = function(){ w.hide(); }; w.bind('click', clearAutoClose, this); timeoutID = setTimeout(autoCloseFunction, autoCloseMilliSeconds); } var playersPaused = this.pauseCurrentPlayers(!containsAudio); w.bind('close', closeFunction, this); w.show(this, true); },
  "changePlayListWithSameSpot": function(playList, newIndex){  var currentIndex = playList.get('selectedIndex'); if (currentIndex >= 0 && newIndex >= 0 && currentIndex != newIndex) { var currentItem = playList.get('items')[currentIndex]; var newItem = playList.get('items')[newIndex]; var currentPlayer = currentItem.get('player'); var newPlayer = newItem.get('player'); if ((currentPlayer.get('class') == 'PanoramaPlayer' || currentPlayer.get('class') == 'Video360Player') && (newPlayer.get('class') == 'PanoramaPlayer' || newPlayer.get('class') == 'Video360Player')) { var newCamera = this.cloneCamera(newItem.get('camera')); this.setCameraSameSpotAsMedia(newCamera, currentItem.get('media')); this.startPanoramaWithCamera(newItem.get('media'), newCamera); } } },
  "showPopupPanoramaOverlay": function(popupPanoramaOverlay, closeButtonProperties, imageHD, toggleImage, toggleImageHD, autoCloseMilliSeconds, audio, stopBackgroundAudio){  var self = this; this.MainViewer.set('toolTipEnabled', false); var cardboardEnabled = this.isCardboardViewMode(); if(!cardboardEnabled) { var zoomImage = this.zoomImagePopupPanorama; var showDuration = popupPanoramaOverlay.get('showDuration'); var hideDuration = popupPanoramaOverlay.get('hideDuration'); var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); var popupMaxWidthBackup = popupPanoramaOverlay.get('popupMaxWidth'); var popupMaxHeightBackup = popupPanoramaOverlay.get('popupMaxHeight'); var showEndFunction = function() { var loadedFunction = function(){ if(!self.isCardboardViewMode()) popupPanoramaOverlay.set('visible', false); }; popupPanoramaOverlay.unbind('showEnd', showEndFunction, self); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', 1); self.showPopupImage(imageHD, toggleImageHD, popupPanoramaOverlay.get('popupMaxWidth'), popupPanoramaOverlay.get('popupMaxHeight'), null, null, closeButtonProperties, autoCloseMilliSeconds, audio, stopBackgroundAudio, loadedFunction, hideFunction); }; var hideFunction = function() { var restoreShowDurationFunction = function(){ popupPanoramaOverlay.unbind('showEnd', restoreShowDurationFunction, self); popupPanoramaOverlay.set('visible', false); popupPanoramaOverlay.set('showDuration', showDuration); popupPanoramaOverlay.set('popupMaxWidth', popupMaxWidthBackup); popupPanoramaOverlay.set('popupMaxHeight', popupMaxHeightBackup); }; self.resumePlayers(playersPaused, audio == null || !stopBackgroundAudio); var currentWidth = zoomImage.get('imageWidth'); var currentHeight = zoomImage.get('imageHeight'); popupPanoramaOverlay.bind('showEnd', restoreShowDurationFunction, self, true); popupPanoramaOverlay.set('showDuration', 1); popupPanoramaOverlay.set('hideDuration', hideDuration); popupPanoramaOverlay.set('popupMaxWidth', currentWidth); popupPanoramaOverlay.set('popupMaxHeight', currentHeight); if(popupPanoramaOverlay.get('visible')) restoreShowDurationFunction(); else popupPanoramaOverlay.set('visible', true); self.MainViewer.set('toolTipEnabled', true); }; if(!imageHD){ imageHD = popupPanoramaOverlay.get('image'); } if(!toggleImageHD && toggleImage){ toggleImageHD = toggleImage; } popupPanoramaOverlay.bind('showEnd', showEndFunction, this, true); } else { var hideEndFunction = function() { self.resumePlayers(playersPaused, audio == null || stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ self.resumeGlobalAudios(); } self.stopGlobalAudio(audio); } popupPanoramaOverlay.unbind('hideEnd', hideEndFunction, self); self.MainViewer.set('toolTipEnabled', true); }; var playersPaused = this.pauseCurrentPlayers(audio == null || !stopBackgroundAudio); if(audio){ if(stopBackgroundAudio){ this.pauseGlobalAudios(); } this.playGlobalAudio(audio); } popupPanoramaOverlay.bind('hideEnd', hideEndFunction, this, true); } popupPanoramaOverlay.set('visible', true); },
  "getPlayListItems": function(media, player){  var itemClass = (function() { switch(media.get('class')) { case 'Panorama': case 'LivePanorama': case 'HDRPanorama': return 'PanoramaPlayListItem'; case 'Video360': return 'Video360PlayListItem'; case 'PhotoAlbum': return 'PhotoAlbumPlayListItem'; case 'Map': return 'MapPlayListItem'; case 'Video': return 'VideoPlayListItem'; } })(); if (itemClass != undefined) { var items = this.getByClassName(itemClass); for (var i = items.length-1; i>=0; --i) { var item = items[i]; if(item.get('media') != media || (player != undefined && item.get('player') != player)) { items.splice(i, 1); } } return items; } else { return []; } },
  "startPanoramaWithCamera": function(media, camera){  if(window.currentPanoramasWithCameraChanged != undefined && window.currentPanoramasWithCameraChanged.indexOf(media) != -1){ return; } var playLists = this.getByClassName('PlayList'); if(playLists.length == 0) return; var restoreItems = []; for(var i = 0, count = playLists.length; i<count; ++i){ var playList = playLists[i]; var items = playList.get('items'); for(var j = 0, countJ = items.length; j<countJ; ++j){ var item = items[j]; if(item.get('media') == media && (item.get('class') == 'PanoramaPlayListItem' || item.get('class') == 'Video360PlayListItem')){ restoreItems.push({camera: item.get('camera'), item: item}); item.set('camera', camera); } } } if(restoreItems.length > 0) { if(window.currentPanoramasWithCameraChanged == undefined) { window.currentPanoramasWithCameraChanged = [media]; } else { window.currentPanoramasWithCameraChanged.push(media); } var restoreCameraOnStop = function(){ var index = window.currentPanoramasWithCameraChanged.indexOf(media); if(index != -1) { window.currentPanoramasWithCameraChanged.splice(index, 1); } for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.set('camera', restoreItems[i].camera); restoreItems[i].item.unbind('stop', restoreCameraOnStop, this); } }; for (var i = 0; i < restoreItems.length; i++) { restoreItems[i].item.bind('stop', restoreCameraOnStop, this); } } },
  "getFirstPlayListWithMedia": function(media, onlySelected){  var playLists = this.getPlayListsWithMedia(media, onlySelected); return playLists.length > 0 ? playLists[0] : undefined; },
  "setEndToItemIndex": function(playList, fromIndex, toIndex){  var endFunction = function(){ if(playList.get('selectedIndex') == fromIndex) playList.set('selectedIndex', toIndex); }; this.executeFunctionWhenChange(playList, fromIndex, endFunction); }
 },
 "left": 577.55,
 "gap": 10,
 "children": [
  "this.MainViewer_mobile",
  "this.Container_7F59BED9_7065_6DCD_41D6_B4AD3EEA9174_mobile",
  "this.Container_EF8F8BD8_E386_8E03_41E3_4CF7CC1F4D8E_mobile",
  "this.Container_BD141CC8_9478_145B_41D4_265F47E47DB6_mobile",
  "this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15_mobile",
  "this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7_mobile",
  "this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41_mobile",
  "this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E_mobile",
  "this.Container_BD84EAD4_9478_3C4B_41C0_BDBA5096F748_mobile",
  "this.veilPopupPanorama",
  "this.zoomImagePopupPanorama",
  "this.closeButtonPopupPanorama"
 ],
 "horizontalAlign": "left",
 "paddingRight": 0,
 "buttonToggleFullscreen": "this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_mobile",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 20,
 "layout": "absolute",
 "desktopMipmappingEnabled": false,
 "start": "this.playAudioList([this.audio_FCDEDC63_BC3F_0D04_41C3_B3B5758CC5EB, this.audio_FCF2E86E_BC3F_351D_41D9_B749614844E0, this.audio_FCDADBD6_BC3F_0B0C_41E3_DB755F3759D5, this.audio_FCEEDA27_BC3F_350D_41C2_303E4F67905F, this.audio_FCCBAE0B_BC3F_0D04_41D0_B503CC7B9FAB, this.audio_831926D5_BC3F_3D0C_41E6_9B744B3F42B1, this.audio_FCF997E0_BC3F_3B04_41D1_F45CFCD1D836, this.audio_FCF7290A_BC3F_3707_41C7_561A6F85CB92, this.audio_FCEB299B_BC3F_3705_41E0_8AC73FF3978D, this.audio_FCE29AB3_BC3F_3504_41E2_5B379CEB0160, this.audio_FCE6EB40_BC3F_0B04_41D7_F615F6AB7F2D, this.audio_FCD31CF9_BC3F_0D04_41D8_0CB527746A42, this.audio_FCD6CD80_BC3F_0F04_41D3_C9198E452B68]); this['MainViewer'] = this.MainViewer_mobile; this['MapViewer'] = this.MapViewer_mobile; this.init(); this.visibleComponentsIfPlayerFlagEnabled([this.IconButton_6658D838_74AF_8B5A_41D7_154D466041BB_mobile,this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_mobile], 'gyroscopeAvailable'); this.syncPlaylists([this.mainPlayList,this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist]); if(!this.get('fullscreenAvailable')) { [this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_mobile].forEach(function(component) { component.set('visible', false); }) }",
 "buttonToggleMute": "this.IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D_mobile",
 "contentOpaque": false,
 "minWidth": 20,
 "downloadEnabled": false,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "definitions": [{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.06,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 784
   }
  ]
 },
 "pitch": 6.91,
 "popupMaxWidth": "95%",
 "yaw": 100.15,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.71,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 763
   }
  ]
 },
 "pitch": 9.08,
 "popupMaxWidth": "95%",
 "yaw": 149.29,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_6658D838_74AF_8B5A_41D7_154D466041BB_mobile",
 "width": 50,
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_6658D838_74AF_8B5A_41D7_154D466041BB.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_6658D838_74AF_8B5A_41D7_154D466041BB_pressed.png",
 "data": {
  "name": "IconButton Gyroscopic"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2658,
   "height": 2598
  },
  {
   "url": "media/popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 2001
  },
  {
   "url": "media/popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1000
  },
  {
   "url": "media/popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 500
  }
 ],
 "id": "ImageResource_A9F2AEB8_BF1F_4F80_41E2_038CF680E6B6"
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCE6EB40_BC3F_0B04_41D7_F615F6AB7F2D.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCE6EB40_BC3F_0B04_41D7_F615F6AB7F2D.ogg"
 },
 "id": "audio_FCE6EB40_BC3F_0B04_41D7_F615F6AB7F2D",
 "data": {
  "label": "Mborayhu Asy, Luis Alberto del Paran\u00e1"
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.11,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 763
   }
  ]
 },
 "pitch": 24.6,
 "popupMaxWidth": "95%",
 "yaw": 111.29,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 11.65,
    "targetYaw": -2.01,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 22.41,
    "targetPitch": 0.25
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -29.02,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -18.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -89.31,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.19
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -131.51,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -161.41,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.95
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 81.77,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -8.73
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_9E58D78E_BF1F_7D81_41D3_9327C788BFEB",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 19.92,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3255,
   "height": 2601
  },
  {
   "url": "media/popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1636
  },
  {
   "url": "media/popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 818
  },
  {
   "url": "media/popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 409
  }
 ],
 "id": "ImageResource_A9F07EBB_BF1F_4F80_41C3_B297A0F56BE3"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 50.49,
    "targetYaw": 0,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 100.45,
    "yawSpeed": 100.45,
    "path": "shortest",
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 0.13,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 29.46
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 101.62,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -4.96
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 123.73,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -11.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -122.97,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 33.25,
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -105.89,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -91.57,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.21
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A7936B48_BF1F_7680_41D2_7D9E5F427FCD",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 90.83,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DBCD382_7065_343F_41D8_FC14DFF91DA9_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.03,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 848,
    "height": 1023
   }
  ]
 },
 "pitch": 9.32,
 "popupMaxWidth": "95%",
 "yaw": -56.54,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.18,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 781
   }
  ]
 },
 "pitch": 2.49,
 "popupMaxWidth": "95%",
 "yaw": 143.14,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD874AD4_9478_3C4B_41DE_DE522887B2C7_mobile",
 "layout": "horizontal",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 0,
 "horizontalAlign": "right",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 0,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 1,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "5%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container space"
 },
 "paddingTop": 20,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2658,
   "height": 2598
  },
  {
   "url": "media/popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 2001
  },
  {
   "url": "media/popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1000
  },
  {
   "url": "media/popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 500
  }
 ],
 "id": "ImageResource_A9E61EAC_BF1F_4F80_41D5_51C471888BA3"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.42,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 688
   }
  ]
 },
 "pitch": 12.25,
 "popupMaxWidth": "95%",
 "yaw": 54.09,
 "showDuration": 500
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCD31CF9_BC3F_0D04_41D8_0CB527746A42.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCD31CF9_BC3F_0D04_41D8_0CB527746A42.ogg"
 },
 "id": "audio_FCD31CF9_BC3F_0D04_41D8_0CB527746A42",
 "data": {
  "label": "\u00d1emongeta Ok\u00e1ra - Eladio Gonzalez"
 }
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7DB20382_7065_343F_4186_6E0B0B3AFF36_mobile",
  "this.IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4_mobile"
 ],
 "class": "Container",
 "id": "Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile",
 "left": "0%",
 "width": "100%",
 "gap": 10,
 "visible": false,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "creationPolicy": "inAdvance",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "- EXPANDED"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1962,
   "height": 2284
  },
  {
   "url": "media/popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1759,
   "height": 2048
  },
  {
   "url": "media/popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 879,
   "height": 1024
  },
  {
   "url": "media/popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 439,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C95E93_BF1F_4F80_41DF_5F22D3F34F47"
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Museo del Cabildo - Entrada",
 "id": "panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0",
 "adjacentPanoramas": [
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD"
  },
  {
   "backwardYaw": -0.44,
   "class": "AdjacentPanorama",
   "yaw": -168.41,
   "distance": 1,
   "panorama": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23"
  },
  {
   "backwardYaw": 156.1,
   "class": "AdjacentPanorama",
   "yaw": -7.03,
   "distance": 1,
   "panorama": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873"
  },
  {
   "backwardYaw": 165.44,
   "class": "AdjacentPanorama",
   "yaw": 4.15,
   "distance": 1,
   "panorama": "this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_AFFBBF16_BC35_0B0C_41E3_D513F6A7C1B1",
  "this.overlay_A891A2A0_BC35_3504_41D0_85B70BACCED1",
  "this.overlay_A9737201_BC4B_1504_41BC_1C7DF205DFA8",
  "this.overlay_9FEA00AC_BCCB_151C_41C0_0B2D2C40D004",
  "this.popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD",
  "this.overlay_9FB47C12_BCCB_0D04_4198_80C208D570C7",
  "this.overlay_9FF72AB9_BCCD_1504_41DC_CD266E51E96A",
  "this.overlay_9FE09F4A_BCCD_0B04_419A_9F04DBD9B682",
  "this.popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1",
  "this.popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5",
  "this.popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB",
  "this.overlay_9B3509B7_BCD7_370C_41E3_18DA809B2009"
 ],
 "hfovMax": 130
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCD6CD80_BC3F_0F04_41D3_C9198E452B68.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCD6CD80_BC3F_0F04_41D3_C9198E452B68.ogg"
 },
 "id": "audio_FCD6CD80_BC3F_0F04_41D3_C9198E452B68",
 "data": {
  "label": "Pyhare Amang\u00fdpe - Emiliano R. Fern\u00e1ndez"
 }
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DB34382_7065_343F_41CB_A5B96E9749EE_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2697,
   "height": 3565
  },
  {
   "url": "media/popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1549,
   "height": 2048
  },
  {
   "url": "media/popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 774,
   "height": 1024
  },
  {
   "url": "media/popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 387,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C2CE8A_BF1F_4F80_41DC_0823EB01ADB4"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2292,
   "height": 1710
  },
  {
   "url": "media/popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1527
  },
  {
   "url": "media/popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 763
  },
  {
   "url": "media/popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 381
  }
 ],
 "id": "ImageResource_A9ACEE78_BF1F_4E80_41E2_4BC6DC0ACBBD"
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_221C1648_0C06_E5FD_4180_8A2E8B66315E_mobile",
  "this.Container_221B3648_0C06_E5FD_4199_FCE031AE003B_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--LOCATION"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.6
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7DDFBAE_BF1F_7580_41DE_50731FF10212",
 "id": "camera_A7DDEBAE_BF1F_7580_41E4_85CA31AC1A00",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 87.28,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0.8,
 "fontSize": "26px",
 "shadowBlurRadius": 6,
 "class": "Button",
 "id": "Button_7DBC8382_7065_343F_4183_17B44518DB40_mobile",
 "pressedBackgroundOpacity": 1,
 "width": "100%",
 "shadowColor": "#000000",
 "fontFamily": "Oswald",
 "label": "\u00c1lbum de Fotos",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "paddingLeft": 10,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E_mobile, true, 0, null, null, false); this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false)",
 "borderColor": "#000000",
 "gap": 5,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "height": 60,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "italic",
 "verticalAlign": "middle",
 "propagateClick": true,
 "iconHeight": 32,
 "data": {
  "name": "Button Photoalbum"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 32,
 "textDecoration": "none",
 "paddingTop": 0,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2150,
   "height": 2519
  },
  {
   "url": "media/popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1747,
   "height": 2048
  },
  {
   "url": "media/popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 873,
   "height": 1024
  },
  {
   "url": "media/popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 436,
   "height": 512
  }
 ],
 "id": "ImageResource_A9D06E9A_BF1F_4F80_41C6_6E68472167B7"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1B81E_B8EE_8E14_4199_02C3916922CB",
 "id": "panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.77,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 817,
    "height": 1024
   }
  ]
 },
 "pitch": 4.31,
 "popupMaxWidth": "95%",
 "yaw": -28.21,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_38922473_0C06_2593_4199_C585853A1AB3_mobile",
 "rollOverIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_rollover.jpg",
 "width": "100%",
 "maxWidth": 60,
 "right": 20,
 "horizontalAlign": "right",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "top": 20,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "height": "36.14%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": false,
 "verticalAlign": "top",
 "pressedIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_pressed.jpg",
 "data": {
  "name": "IconButton X"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.96,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 875,
    "height": 1024
   }
  ]
 },
 "pitch": 3.54,
 "popupMaxWidth": "95%",
 "yaw": -164.29,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1D81E_B8EE_8E14_418C_DA8A1A4AAA66",
 "id": "panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "itemLabelFontWeight": "normal",
 "itemBackgroundOpacity": 0,
 "class": "ThumbnailGrid",
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile",
 "left": 0,
 "itemHeight": 180,
 "width": "100%",
 "itemThumbnailBorderRadius": 15,
 "itemPaddingTop": 3,
 "gap": 29,
 "itemBackgroundColorDirection": "vertical",
 "horizontalAlign": "center",
 "rollOverItemThumbnailShadowHorizontalLength": 8,
 "scrollBarColor": "#04A3E1",
 "selectedItemLabelFontColor": "#04A3E1",
 "selectedItemThumbnailShadow": true,
 "rollOverItemThumbnailShadowColor": "#04A3E1",
 "paddingLeft": 70,
 "borderSize": 0,
 "itemVerticalAlign": "top",
 "minHeight": 1,
 "itemPaddingRight": 3,
 "itemLabelGap": 7,
 "selectedItemThumbnailShadowHorizontalLength": 0,
 "minWidth": 1,
 "itemLabelFontColor": "#666666",
 "itemMinWidth": 50,
 "height": "92%",
 "itemLabelPosition": "bottom",
 "propagateClick": false,
 "itemLabelFontStyle": "italic",
 "itemLabelFontSize": 16,
 "shadow": false,
 "itemMode": "normal",
 "scrollBarWidth": 10,
 "backgroundOpacity": 0,
 "borderRadius": 5,
 "rollOverItemThumbnailShadowBlurRadius": 0,
 "itemBackgroundColor": [],
 "rollOverItemThumbnailShadowVerticalLength": 0,
 "paddingRight": 70,
 "itemOpacity": 1,
 "itemThumbnailHeight": 136,
 "playList": "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist",
 "itemHorizontalAlign": "center",
 "itemThumbnailWidth": 209,
 "itemLabelHorizontalAlign": "center",
 "itemThumbnailShadow": false,
 "itemMaxWidth": 1000,
 "itemWidth": 230,
 "selectedItemThumbnailShadowBlurRadius": 16,
 "itemLabelFontFamily": "Oswald",
 "paddingBottom": 70,
 "itemThumbnailOpacity": 1,
 "itemLabelTextDecoration": "none",
 "itemMinHeight": 50,
 "bottom": -0.2,
 "scrollBarVisible": "rollOver",
 "itemBorderRadius": 0,
 "scrollBarOpacity": 0.5,
 "itemBackgroundColorRatios": [],
 "selectedItemLabelFontWeight": "bold",
 "verticalAlign": "top",
 "itemThumbnailScaleMode": "fit_outside",
 "selectedItemThumbnailShadowVerticalLength": 0,
 "scrollBarMargin": 2,
 "itemPaddingBottom": 3,
 "paddingTop": 10,
 "itemMaxHeight": 1000,
 "data": {
  "name": "ThumbnailList"
 },
 "rollOverItemThumbnailShadow": true,
 "itemPaddingLeft": 3,
 "rollOverItemLabelFontColor": "#04A3E1"
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DB3E382_7065_343F_41C2_E1E6BB5BA055_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3148,
   "height": 2402
  },
  {
   "url": "media/popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1562
  },
  {
   "url": "media/popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 781
  },
  {
   "url": "media/popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 390
  }
 ],
 "id": "ImageResource_A9F44EBF_BF1F_4F80_41E6_152BE9848710"
},
{
 "width": 3386,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B0A52F96_BEE9_CD80_41CA_06DC332482DD.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B0A52F96_BEE9_CD80_41CA_06DC332482DD",
 "height": 2278
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9BB5C075_BC35_150C_41D5_56C7BD185F99_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 4108,
   "height": 3145
  },
  {
   "url": "media/popup_9BB5C075_BC35_150C_41D5_56C7BD185F99_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 4096,
   "height": 3135
  },
  {
   "url": "media/popup_9BB5C075_BC35_150C_41D5_56C7BD185F99_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1567
  },
  {
   "url": "media/popup_9BB5C075_BC35_150C_41D5_56C7BD185F99_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 783
  }
 ],
 "id": "ImageResource_A9AF8E75_BF1F_4E80_41DA_7B63C45B871E"
},
{
 "borderRadius": 0,
 "maxHeight": 1095,
 "class": "Image",
 "id": "Image_7DB3C373_7065_34DE_41BA_CF5206137DED_mobile",
 "left": "0%",
 "width": "100%",
 "maxWidth": 1095,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "url": "skin/Image_7DB3C373_7065_34DE_41BA_CF5206137DED.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 30,
 "top": "0.12%",
 "minWidth": 40,
 "bottom": "75.93%",
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "scaleMode": "fit_inside",
 "data": {
  "name": "Image Company"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2866,
   "height": 2864
  },
  {
   "url": "media/popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2047,
   "height": 2046
  },
  {
   "url": "media/popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1023,
   "height": 1023
  },
  {
   "url": "media/popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 511,
   "height": 511
  }
 ],
 "id": "ImageResource_A9E51EAC_BF1F_4F80_41D1_F69242E69FA2"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.15,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 679,
    "height": 1024
   }
  ]
 },
 "pitch": 1.12,
 "popupMaxWidth": "95%",
 "yaw": 72.74,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3823,
   "height": 2888
  },
  {
   "url": "media/popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2047,
   "height": 1547
  },
  {
   "url": "media/popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1023,
   "height": 773
  },
  {
   "url": "media/popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 511,
   "height": 386
  }
 ],
 "id": "ImageResource_A9BBCE81_BF1F_4F80_41D6_342186F94CBD"
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Museo del Cabildo - Medio",
 "id": "panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873",
 "adjacentPanoramas": [
  {
   "backwardYaw": 177.7,
   "class": "AdjacentPanorama",
   "yaw": -0.95,
   "distance": 1,
   "panorama": "this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B"
  },
  {
   "backwardYaw": -7.03,
   "class": "AdjacentPanorama",
   "yaw": 156.1,
   "distance": 1,
   "panorama": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0"
  },
  {
   "backwardYaw": -9.43,
   "class": "AdjacentPanorama",
   "yaw": 169.38,
   "distance": 1,
   "panorama": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A94B2488_BC4A_FD04_41E4_2500E620FD26",
  "this.overlay_AA5D31C3_BC4D_3704_41A3_FDFDA25BF794",
  "this.overlay_A9B6BCE1_BC4D_0D04_41C2_C66878955848",
  "this.overlay_901BC594_BC37_7F0C_41BA_D1FB199C3765",
  "this.overlay_901BD595_BC37_7F0C_41DB_7F0E62F173A4",
  "this.overlay_901BD595_BC37_7F0C_41E2_732CA44E9E21",
  "this.overlay_901BE595_BC37_7F0C_41D8_081EC58E5660",
  "this.overlay_8DA4043F_BC37_1D7C_41D7_AC7A7D9CF720",
  "this.overlay_9A17174C_BC35_1B1C_41E5_5B7231D574D0",
  "this.overlay_9BBAC0A4_BC35_150C_41E2_F90CE2D4ECC1",
  "this.overlay_9A74F26F_BC3B_151C_41D4_A2DD2D3AD121",
  "this.overlay_9A35C3FD_BC3B_1AFC_41E4_34F745E13821",
  "this.popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9",
  "this.popup_9017054F_BC37_7F1C_41CD_9E79E5C22836",
  "this.popup_90173551_BC37_7F04_41C9_80B87737433F",
  "this.popup_9017E552_BC37_7F04_41A5_19434122D6E1",
  "this.popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B",
  "this.popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099",
  "this.popup_9BB5C075_BC35_150C_41D5_56C7BD185F99",
  "this.popup_9A79123D_BC3B_157C_41C1_B207E716906B",
  "this.popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669"
 ],
 "hfovMax": 130
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.41,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1000
   }
  ]
 },
 "pitch": 1.64,
 "popupMaxWidth": "95%",
 "yaw": -17.41,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1903,
   "height": 2299
  },
  {
   "url": "media/popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1695,
   "height": 2048
  },
  {
   "url": "media/popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 847,
   "height": 1024
  },
  {
   "url": "media/popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 423,
   "height": 512
  }
 ],
 "id": "ImageResource_A9D52E9E_BF1F_4F80_41E3_7908B25B01A3"
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DB2F382_7065_343F_41C8_85C6AE9C717F_mobile",
 "layout": "horizontal",
 "backgroundColorRatios": [
  0
 ],
 "width": 40,
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "backgroundColor": [
  "#5CA1DE"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 2,
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "blue line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 1
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7CB4B90_BF1F_7580_41C9_0A664B7EB470",
 "id": "camera_A7CB7B90_BF1F_7580_41B5_A79C0516FE60",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 177.23,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.87,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1023,
    "height": 1023
   }
  ]
 },
 "pitch": 2.58,
 "popupMaxWidth": "95%",
 "yaw": -17.26,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.21,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 939,
    "height": 1024
   }
  ]
 },
 "pitch": 5.11,
 "popupMaxWidth": "95%",
 "yaw": -34.28,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.19,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 830,
    "height": 1023
   }
  ]
 },
 "pitch": 11.7,
 "popupMaxWidth": "95%",
 "yaw": 108.04,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.49,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 906,
    "height": 1024
   }
  ]
 },
 "pitch": 6.79,
 "popupMaxWidth": "95%",
 "yaw": -118.43,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.76,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 872,
    "height": 1024
   }
  ]
 },
 "pitch": -20.29,
 "popupMaxWidth": "95%",
 "yaw": 50.99,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A0814000_BCDD_1504_41DE_578F53E9F700_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3148,
   "height": 2402
  },
  {
   "url": "media/popup_A0814000_BCDD_1504_41DE_578F53E9F700_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1562
  },
  {
   "url": "media/popup_A0814000_BCDD_1504_41DE_578F53E9F700_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 781
  },
  {
   "url": "media/popup_A0814000_BCDD_1504_41DE_578F53E9F700_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 390
  }
 ],
 "id": "ImageResource_A9EABEB1_BF1F_4F80_41DE_B6329F1E9B99"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_90173551_BC37_7F04_41C9_80B87737433F_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3386,
   "height": 2278
  },
  {
   "url": "media/popup_90173551_BC37_7F04_41C9_80B87737433F_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1377
  },
  {
   "url": "media/popup_90173551_BC37_7F04_41C9_80B87737433F_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 688
  },
  {
   "url": "media/popup_90173551_BC37_7F04_41C9_80B87737433F_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 344
  }
 ],
 "id": "ImageResource_A9AAFE71_BF1F_4E80_41AA_5D7E005F68BF"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3290,
   "height": 2786
  },
  {
   "url": "media/popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1734
  },
  {
   "url": "media/popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 867
  },
  {
   "url": "media/popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 433
  }
 ],
 "id": "ImageResource_A9FB7EC0_BF1F_4F80_41E2_F2DD5B03C613"
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_39A197B1_0C06_62AF_419A_D15E4DDD2528_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--PANORAMA LIST"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.6
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.44,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 817,
    "height": 1024
   }
  ]
 },
 "pitch": 8.94,
 "popupMaxWidth": "95%",
 "yaw": -109,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1903,
   "height": 2299
  },
  {
   "url": "media/popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1695,
   "height": 2048
  },
  {
   "url": "media/popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 847,
   "height": 1024
  },
  {
   "url": "media/popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 423,
   "height": 512
  }
 ],
 "id": "ImageResource_A9E2AEA9_BF1F_4F80_41E2_1756BFA258CA"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.55,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A79DC513_BCCB_3F04_41C6_F86CA962705F",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A79DC513_BCCB_3F04_41C6_F86CA962705F_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 917,
    "height": 1024
   }
  ]
 },
 "pitch": 4.97,
 "popupMaxWidth": "95%",
 "yaw": -71.74,
 "showDuration": 500
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--FLOORPLAN"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.6
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A08091DD_BCDF_173D_41DD_6E87ABA42077_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2150,
   "height": 2519
  },
  {
   "url": "media/popup_A08091DD_BCDF_173D_41DD_6E87ABA42077_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1747,
   "height": 2048
  },
  {
   "url": "media/popup_A08091DD_BCDF_173D_41DD_6E87ABA42077_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 873,
   "height": 1024
  },
  {
   "url": "media/popup_A08091DD_BCDF_173D_41DD_6E87ABA42077_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 436,
   "height": 512
  }
 ],
 "id": "ImageResource_A9E88EB3_BF1F_4F80_41AD_5A858EED408A"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2432,
   "height": 2898
  },
  {
   "url": "media/popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1718,
   "height": 2048
  },
  {
   "url": "media/popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 859,
   "height": 1024
  },
  {
   "url": "media/popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 429,
   "height": 512
  }
 ],
 "id": "ImageResource_A9BDEE86_BF1F_4F80_41E4_683F4180878B"
},
{
 "width": 3200,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AEF09A22_BEEA_D680_41D5_CEA12B943BF4.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AEF09A22_BEEA_D680_41D5_CEA12B943BF4",
 "height": 4800
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.92,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 875,
    "height": 1024
   }
  ]
 },
 "pitch": 9.21,
 "popupMaxWidth": "95%",
 "yaw": -68.24,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2866,
   "height": 2864
  },
  {
   "url": "media/popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2047,
   "height": 2046
  },
  {
   "url": "media/popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1023,
   "height": 1023
  },
  {
   "url": "media/popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 511,
   "height": 511
  }
 ],
 "id": "ImageResource_A9F22EB9_BF1F_4F80_41CF_73F97A35E7BB"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A72CF2BD_BCD5_157C_418D_12FD770BC899_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2143,
   "height": 2422
  },
  {
   "url": "media/popup_A72CF2BD_BCD5_157C_418D_12FD770BC899_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1812,
   "height": 2048
  },
  {
   "url": "media/popup_A72CF2BD_BCD5_157C_418D_12FD770BC899_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 906,
   "height": 1024
  },
  {
   "url": "media/popup_A72CF2BD_BCD5_157C_418D_12FD770BC899_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 453,
   "height": 512
  }
 ],
 "id": "ImageResource_A9DEEEA5_BF1F_4F80_41BF_22A6C3F660EA"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2658,
   "height": 2598
  },
  {
   "url": "media/popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 2001
  },
  {
   "url": "media/popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 1000
  },
  {
   "url": "media/popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 500
  }
 ],
 "id": "ImageResource_A9DB4EA0_BF1F_4F80_41C0_DD87F39C933D"
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCDADBD6_BC3F_0B0C_41E3_DB755F3759D5.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCDADBD6_BC3F_0B0C_41E3_DB755F3759D5.ogg"
 },
 "id": "audio_FCDADBD6_BC3F_0B0C_41E3_DB755F3759D5",
 "data": {
  "label": "Nde ratypykua - Jose Asunci\u00f3n Flores"
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3386,
   "height": 2278
  },
  {
   "url": "media/popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1377
  },
  {
   "url": "media/popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 688
  },
  {
   "url": "media/popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 344
  }
 ],
 "id": "ImageResource_A9B11E7A_BF1F_4E80_41DA_3BB6103F75ED"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2002,
   "height": 2417
  },
  {
   "url": "media/popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1696,
   "height": 2047
  },
  {
   "url": "media/popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 848,
   "height": 1023
  },
  {
   "url": "media/popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 424,
   "height": 511
  }
 ],
 "id": "ImageResource_A9EE5EB4_BF1F_4F80_41E7_C8CC1A19CC28"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.32,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4_0_1.jpg",
    "class": "ImageResourceLevel",
    "width": 873,
    "height": 1024
   }
  ]
 },
 "pitch": 9.86,
 "popupMaxWidth": "95%",
 "yaw": 126.38,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.65,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 793
   }
  ]
 },
 "pitch": 2.31,
 "popupMaxWidth": "95%",
 "yaw": 156.32,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_BD15FCC8_9478_145B_41DA_B306F52E3FCF_mobile",
  "this.HTMLText_BD15BCC8_9478_145B_41A0_1BDCC9E92EE8_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD15ACC8_9478_145B_41C2_6D37AD97A48D_mobile",
 "layout": "vertical",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#E73B2C",
 "minHeight": 300,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 100,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 10,
 "scrollBarOpacity": 0.79,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container text"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.71,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1000
   }
  ]
 },
 "pitch": 4.99,
 "popupMaxWidth": "95%",
 "yaw": -53.74,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1666,
   "height": 2088
  },
  {
   "url": "media/popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1634,
   "height": 2048
  },
  {
   "url": "media/popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 817,
   "height": 1024
  },
  {
   "url": "media/popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 408,
   "height": 512
  }
 ],
 "id": "ImageResource_A9ED9EB5_BF1F_4F80_41E0_C3EC1018604D"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2228,
   "height": 2910
  },
  {
   "url": "media/popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1568,
   "height": 2048
  },
  {
   "url": "media/popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 784,
   "height": 1024
  },
  {
   "url": "media/popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 392,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C1CE8A_BF1F_4F80_41E1_2755F6C87FB6"
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Arte Popular",
 "id": "panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF",
 "adjacentPanoramas": [
  {
   "backwardYaw": -1.85,
   "class": "AdjacentPanorama",
   "yaw": 154.35,
   "distance": 1,
   "panorama": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_9EF1B7C3_BCF5_1B04_41E1_60CD368A87B4",
  "this.overlay_8DD63674_BC75_3D0C_41D8_4E49BF202257",
  "this.overlay_8DF382B3_BC75_1504_41BA_99DE839F2439"
 ],
 "hfovMax": 130
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.54,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 875,
    "height": 1024
   }
  ]
 },
 "pitch": 2.26,
 "popupMaxWidth": "95%",
 "yaw": -167.87,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.11,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 805,
    "height": 1024
   }
  ]
 },
 "pitch": 10.14,
 "popupMaxWidth": "95%",
 "yaw": 31.82,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1F81D_B8EE_8E17_41C2_20835DB2689F",
 "id": "panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "maxHeight": 1000,
 "class": "Image",
 "id": "Image_BD87AAD4_9478_3C4B_41BE_0345EF6421AD_mobile",
 "width": "100%",
 "maxWidth": 2000,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "url": "skin/Image_BD87AAD4_9478_3C4B_41BE_0345EF6421AD_mobile.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "height": "47.023%",
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "bottom",
 "scaleMode": "fit_inside",
 "data": {
  "name": "Image40635"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.64,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 947,
    "height": 1024
   }
  ]
 },
 "pitch": 2.62,
 "popupMaxWidth": "95%",
 "yaw": -157.15,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.27,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 784
   }
  ]
 },
 "pitch": 3.6,
 "popupMaxWidth": "95%",
 "yaw": 150.97,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A08091DD_BCDF_173D_41DD_6E87ABA42077",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A08091DD_BCDF_173D_41DD_6E87ABA42077_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 873,
    "height": 1024
   }
  ]
 },
 "pitch": 7.17,
 "popupMaxWidth": "95%",
 "yaw": 21.98,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_mobile",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 58,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_pressed.png",
 "data": {
  "name": "IconButton FULLSCREEN"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.71,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 883
   }
  ]
 },
 "pitch": 2.38,
 "popupMaxWidth": "95%",
 "yaw": -154.78,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1666,
   "height": 2088
  },
  {
   "url": "media/popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1634,
   "height": 2048
  },
  {
   "url": "media/popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 817,
   "height": 1024
  },
  {
   "url": "media/popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 408,
   "height": 512
  }
 ],
 "id": "ImageResource_A9E3BEA8_BF1F_4F80_41D6_76034B231539"
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD159CC8_9478_145B_41AA_EFEDE92BF07B_mobile",
 "layout": "horizontal",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 0,
 "horizontalAlign": "right",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 0,
 "contentOpaque": false,
 "height": 50,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container space"
 },
 "paddingTop": 20,
 "backgroundOpacity": 0.3
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.38,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 763
   }
  ]
 },
 "pitch": 14.31,
 "popupMaxWidth": "95%",
 "yaw": 134.35,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2331,
   "height": 2519
  },
  {
   "url": "media/popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1895,
   "height": 2048
  },
  {
   "url": "media/popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 947,
   "height": 1024
  },
  {
   "url": "media/popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 473,
   "height": 512
  }
 ],
 "id": "ImageResource_A9F8EEC5_BF1F_4F80_41D8_D47F1462205E"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2326,
   "height": 2866
  },
  {
   "url": "media/popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1662,
   "height": 2047
  },
  {
   "url": "media/popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 831,
   "height": 1023
  },
  {
   "url": "media/popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 415,
   "height": 511
  }
 ],
 "id": "ImageResource_A9E4EEAE_BF1F_4F80_41DC_0BD5E7ED89DF"
},
{
 "width": 2292,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AE11651D_BEEF_D280_41DB_FDCAD2C25EA1.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AE11651D_BEEF_D280_41DB_FDCAD2C25EA1",
 "height": 1710
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_BD875AD4_9478_3C4B_4145_58969FE396D8_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD878AD4_9478_3C4B_41E0_1542ED46C5EC_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundOpacity": 1,
 "shadowColor": "#000000",
 "right": "5%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "shadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "gap": 10,
 "layout": "horizontal",
 "minHeight": 1,
 "top": "5%",
 "scrollBarColor": "#000000",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "contentOpaque": false,
 "paddingBottom": 0,
 "bottom": "5%",
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "verticalAlign": "top",
 "propagateClick": false,
 "shadowSpread": 1,
 "overflow": "scroll",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadowOpacity": 0.3,
 "data": {
  "name": "Global"
 },
 "shadowBlurRadius": 25
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3274,
   "height": 2538
  },
  {
   "url": "media/popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1587
  },
  {
   "url": "media/popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 793
  },
  {
   "url": "media/popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 396
  }
 ],
 "id": "ImageResource_A9E49EAF_BF1F_4F80_41E2_9997138E35D4"
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Museo del Cabildo - Punta",
 "id": "panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B",
 "adjacentPanoramas": [
  {
   "backwardYaw": 4.15,
   "class": "AdjacentPanorama",
   "yaw": 165.44,
   "distance": 1,
   "panorama": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0"
  },
  {
   "backwardYaw": -0.95,
   "class": "AdjacentPanorama",
   "yaw": 177.7,
   "distance": 1,
   "panorama": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A97DA307_BC4F_1B0D_41B8_88D69897D978",
  "this.overlay_AA0B5962_BC4D_1704_41C3_9A18E8BAFF32",
  "this.overlay_9AA9A485_BC3D_7D0C_41D2_870A0132BE00",
  "this.overlay_9AA9B485_BC3D_7D0C_41E6_327625FA1539",
  "this.overlay_9AA94485_BC3D_7D0C_41DC_A9FE86A803AA",
  "this.overlay_9AA95485_BC3D_7D0C_41D3_ACCECAD491FF",
  "this.overlay_9AA96485_BC3D_7D0C_41D0_C18FE727E332",
  "this.popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B",
  "this.popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE",
  "this.popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B",
  "this.popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4",
  "this.popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A"
 ],
 "hfovMax": 130
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5875843_BC3B_1504_41CF_71FD3606FBC4_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2408,
   "height": 3263
  },
  {
   "url": "media/popup_A5875843_BC3B_1504_41CF_71FD3606FBC4_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1511,
   "height": 2048
  },
  {
   "url": "media/popup_A5875843_BC3B_1504_41CF_71FD3606FBC4_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 755,
   "height": 1024
  },
  {
   "url": "media/popup_A5875843_BC3B_1504_41CF_71FD3606FBC4_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 377,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C7FE8C_BF1F_4F80_41BB_146B4AE8441A"
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCCBAE0B_BC3F_0D04_41D0_B503CC7B9FAB.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCCBAE0B_BC3F_0D04_41D0_B503CC7B9FAB.ogg"
 },
 "id": "audio_FCCBAE0B_BC3F_0D04_41D0_B503CC7B9FAB",
 "data": {
  "label": "Quemil Yambay - ahata che nendive"
 }
},
{
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D_mobile",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 58,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D_pressed.png",
 "data": {
  "name": "IconButton MUTE"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.49,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 848,
    "height": 1023
   }
  ]
 },
 "pitch": 8.66,
 "popupMaxWidth": "95%",
 "yaw": -124.63,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.33,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 367
   }
  ]
 },
 "pitch": 1.6,
 "popupMaxWidth": "95%",
 "yaw": 149.26,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_BD84FAD4_9478_3C4B_41DD_83E1298704B1_mobile",
 "rollOverIconURL": "skin/IconButton_BD84FAD4_9478_3C4B_41DD_83E1298704B1_rollover.jpg",
 "width": "25%",
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_BD84FAD4_9478_3C4B_41DD_83E1298704B1.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "height": "75%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_BD84EAD4_9478_3C4B_41C0_BDBA5096F748_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_BD84FAD4_9478_3C4B_41DD_83E1298704B1_pressed.jpg",
 "data": {
  "name": "X"
 },
 "shadow": false,
 "pressedRollOverIconURL": "skin/IconButton_BD84FAD4_9478_3C4B_41DD_83E1298704B1_pressed_rollover.jpg",
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_EF8F8BD8_E386_8E02_41E5_FC5C5513733A_mobile",
  "this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_EF8F8BD8_E386_8E03_41E3_4CF7CC1F4D8E_mobile",
 "layout": "absolute",
 "width": 115.05,
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 10,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "creationPolicy": "inAdvance",
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "height": 641,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "-- SETTINGS"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_9E29D761_BF1F_7E83_41AB_8412EB7C16B9",
 "id": "camera_9E29E761_BF1F_7E83_41B1_9E1932EB4756",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -25.65,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.36,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 778
   }
  ]
 },
 "pitch": 4.68,
 "popupMaxWidth": "95%",
 "yaw": 158.22,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_BD874AD4_9478_3C4B_41DE_DE522887B2C7_mobile",
  "this.Container_BD877AD4_9478_3C4B_41AC_A13D39E1584C_mobile",
  "this.Container_BD84DAD4_9478_3C4B_41D9_38F6A3F8328B_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD875AD4_9478_3C4B_4145_58969FE396D8_mobile",
 "layout": "vertical",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 0,
 "horizontalAlign": "left",
 "paddingLeft": 60,
 "paddingRight": 60,
 "scrollBarColor": "#0069A3",
 "minHeight": 1,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 460,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 20,
 "scrollBarOpacity": 0.51,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "-right"
 },
 "paddingTop": 20,
 "backgroundOpacity": 1
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_mobile"
 ],
 "class": "Container",
 "id": "Container_2F8A7686_0D4F_6B71_41A9_1A894413085C_mobile",
 "width": "100%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 10,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "minWidth": 1,
 "height": 140,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "verticalAlign": "top",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "overflow": "scroll",
 "shadow": false,
 "data": {
  "name": "header"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A0812001_BCDD_1504_41E5_3BB22DA876C3_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3290,
   "height": 2786
  },
  {
   "url": "media/popup_A0812001_BCDD_1504_41E5_3BB22DA876C3_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1734
  },
  {
   "url": "media/popup_A0812001_BCDD_1504_41E5_3BB22DA876C3_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 867
  },
  {
   "url": "media/popup_A0812001_BCDD_1504_41E5_3BB22DA876C3_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 433
  }
 ],
 "id": "ImageResource_A9E9AEB2_BF1F_4F80_41D9_308020633857"
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329_mobile",
 "width": 60,
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 60,
 "paddingBottom": 0,
 "click": "if(!this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE_mobile.get('visible')){ this.setComponentVisibility(this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE_mobile, true, 0, null, null, false) } else { this.setComponentVisibility(this.Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE_mobile, false, 0, null, null, false) }",
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329_pressed.png",
 "data": {
  "name": "image button menu"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.8,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 848,
    "height": 1024
   }
  ]
 },
 "pitch": 9.77,
 "popupMaxWidth": "95%",
 "yaw": -14.9,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2307,
   "height": 2709
  },
  {
   "url": "media/popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1744,
   "height": 2048
  },
  {
   "url": "media/popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 872,
   "height": 1024
  },
  {
   "url": "media/popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 436,
   "height": 512
  }
 ],
 "id": "ImageResource_A9AD8E77_BF1F_4E80_41D5_4E0D67AAC50B"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.58,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 917,
    "height": 1024
   }
  ]
 },
 "pitch": 2.59,
 "popupMaxWidth": "95%",
 "yaw": -152.24,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3198,
   "height": 2450
  },
  {
   "url": "media/popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1568
  },
  {
   "url": "media/popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 784
  },
  {
   "url": "media/popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 392
  }
 ],
 "id": "ImageResource_A9D37E98_BF1F_4F80_41D5_E31FC1D62238"
},
{
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0.8,
 "fontSize": "26px",
 "shadowBlurRadius": 6,
 "class": "Button",
 "id": "Button_7DB35382_7065_343F_41C5_CF0EAF3E4CFF_mobile",
 "pressedBackgroundOpacity": 1,
 "width": "100%",
 "shadowColor": "#000000",
 "fontFamily": "Oswald",
 "label": "Ubicaci\u00f3n",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "pressedLabel": "Location",
 "paddingLeft": 10,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "layout": "horizontal",
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7_mobile, true, 0, null, null, false); this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false)",
 "borderColor": "#000000",
 "gap": 5,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "height": 60,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "italic",
 "verticalAlign": "middle",
 "propagateClick": true,
 "iconHeight": 32,
 "data": {
  "name": "Button Location"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 32,
 "textDecoration": "none",
 "paddingTop": 0,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DB32382_7065_343F_419E_6594814C420F_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.51,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A0812001_BCDD_1504_41E5_3BB22DA876C3",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A0812001_BCDD_1504_41E5_3BB22DA876C3_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 867
   }
  ]
 },
 "pitch": 7.06,
 "popupMaxWidth": "95%",
 "yaw": 59.36,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.IconButton_38922473_0C06_2593_4199_C585853A1AB3_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 140,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "header"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3444,
   "height": 2816
  },
  {
   "url": "media/popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1674
  },
  {
   "url": "media/popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 837
  },
  {
   "url": "media/popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 418
  }
 ],
 "id": "ImageResource_96F46DDE_BCD5_0F3C_41D1_850B36FDED61"
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_6658E837_74AF_8B56_41B5_2A29A6498E57_mobile",
 "width": 40,
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_6658E837_74AF_8B56_41B5_2A29A6498E57.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 40,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_6658E837_74AF_8B56_41B5_2A29A6498E57_pressed.png",
 "data": {
  "name": "IconButton Fullscreen"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.84,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 847,
    "height": 1024
   }
  ]
 },
 "pitch": 11.25,
 "popupMaxWidth": "95%",
 "yaw": -87.96,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.76,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 796,
    "height": 1024
   }
  ]
 },
 "pitch": 7.84,
 "popupMaxWidth": "95%",
 "yaw": 128.4,
 "showDuration": 500
},
{
 "thumbnailUrl": "media/album_ACD0A618_BD0B_C4C9_41D4_A1949BC36882_t.png",
 "class": "PhotoAlbum",
 "label": "\u00c1lbum de Fotos",
 "id": "album_ACD0A618_BD0B_C4C9_41D4_A1949BC36882",
 "playList": "this.album_ACD0A618_BD0B_C4C9_41D4_A1949BC36882_AlbumPlayList"
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "class": "HTMLText",
 "id": "HTMLText_7DB2E382_7065_343F_41C2_951F708170F1_mobile",
 "visible": false,
 "width": "100%",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "minWidth": 1,
 "height": 78,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "scrollBarMargin": 2,
 "data": {
  "name": "HTMLText47602"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>Company Name</I></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>www.loremipsum.com</I></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>info@loremipsum.com</I></SPAN></SPAN></DIV><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0px; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#ffffff;font-size:14px;font-family:'Oswald Regular';\"><I>Tlf.: +11 111 111 111</I></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3274,
   "height": 2538
  },
  {
   "url": "media/popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1587
  },
  {
   "url": "media/popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 793
  },
  {
   "url": "media/popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 396
  }
 ],
 "id": "ImageResource_A9F67EBD_BF1F_4F80_41D6_2AE3F85B53F7"
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "class": "HTMLText",
 "id": "HTMLText_BD872AD4_9478_3C4B_41E0_004DEE953DF2_mobile",
 "width": "74.811%",
 "paddingRight": 10,
 "paddingLeft": 15,
 "borderSize": 0,
 "scrollBarColor": "#04A3E1",
 "minHeight": 1,
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "paddingBottom": 10,
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "HTMLText19460"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f3a22e;\"><A HREF=\"https://tel:0981408400\" TARGET=\"_blank\" STYLE=\"text-decoration:none; color:inherit;\"><SPAN STYLE=\"color:#0000ff;font-size:4.86vw;font-family:'Oswald';\"><I>+595 981 408 400</I></SPAN></A></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.94vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#0000ff;font-size:4.86vw;font-family:'Oswald';\"><I>rholand@visitapy.com</I></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.94vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#f3a22e;\"><A HREF=\"https://www.visitapy.com\" TARGET=\"_blank\" STYLE=\"text-decoration:none; color:inherit;\"><SPAN STYLE=\"color:#0000ff;font-size:4.86vw;font-family:'Oswald';\"><I>www.visitapy.com</I></SPAN></A></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_BD15DCC8_9478_145B_41E1_35766BBBD98F_mobile",
  "this.Container_BD147CC8_9478_145B_41E1_A1505134A3C3_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD141CC8_9478_145B_41D4_265F47E47DB6_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_BD141CC8_9478_145B_41D4_265F47E47DB6_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--INFO photo"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.6
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 5.2,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4_0_3.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 682
   }
  ]
 },
 "pitch": -5.61,
 "popupMaxWidth": "95%",
 "yaw": 156.49,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2342,
   "height": 2739
  },
  {
   "url": "media/popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1751,
   "height": 2048
  },
  {
   "url": "media/popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 875,
   "height": 1024
  },
  {
   "url": "media/popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 437,
   "height": 512
  }
 ],
 "id": "ImageResource_A9FDEEC7_BF1F_4F80_41E2_3C33B329026C"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2159,
   "height": 2668
  },
  {
   "url": "media/popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1657,
   "height": 2048
  },
  {
   "url": "media/popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 828,
   "height": 1024
  },
  {
   "url": "media/popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 414,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C6FE8E_BF1F_4F80_41C3_4B6B4FC1EDFE"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A8A3F9FA_BF1F_7580_41C9_5E37C9016366",
 "id": "camera_A8A3E9FA_BF1F_7580_41CC_484E1892610F",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 2.4,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DBCB382_7065_343F_41D8_AB382D384291_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1826,
   "height": 2136
  },
  {
   "url": "media/popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1750,
   "height": 2048
  },
  {
   "url": "media/popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 875,
   "height": 1024
  },
  {
   "url": "media/popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 437,
   "height": 512
  }
 ],
 "id": "ImageResource_A9F37EB7_BF1F_4F80_41B4_6A5E453EB7F1"
},
{
 "class": "PlayList",
 "items": [
  {
   "player": "this.MainViewer_mobilePhotoAlbumPlayer",
   "class": "PhotoAlbumPlayListItem",
   "media": "this.album_ACD0A618_BD0B_C4C9_41D4_A1949BC36882"
  }
 ],
 "id": "playList_9F8076DE_BF1F_7F80_41DB_A99796CE206D"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.28,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 902,
    "height": 1024
   }
  ]
 },
 "pitch": 7.09,
 "popupMaxWidth": "95%",
 "yaw": -149.04,
 "showDuration": 500
},
{
 "width": 1721,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B3714AB2_BEEF_5780_419E_CCE1C76FC3E0.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B3714AB2_BEEF_5780_419E_CCE1C76FC3E0",
 "height": 2018
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A86EE98B_BF1F_7580_41C8_296284A1995D",
 "id": "camera_A86E898B_BF1F_7580_41B7_C7154CA11ACA",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 177.16,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2333,
   "height": 2014
  },
  {
   "url": "media/popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1767
  },
  {
   "url": "media/popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 883
  },
  {
   "url": "media/popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 441
  }
 ],
 "id": "ImageResource_A9FF0EC4_BF1F_4F80_41AB_BFD0D7AD960D"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.04,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 774,
    "height": 1024
   }
  ]
 },
 "pitch": 12.65,
 "popupMaxWidth": "95%",
 "yaw": 124.42,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD146CC8_9478_145B_41D1_ED9BAFE44A6B_mobile",
 "layout": "horizontal",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": 370,
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 30,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container space"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_9E397770_BF1F_7E81_41D7_89CFC97724CD",
 "id": "camera_9E396770_BF1F_7E81_41DA_0868D73461E1",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 179.4,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "children": [
  "this.MapViewer_mobile",
  "this.Container_2F8A7686_0D4F_6B71_41A9_1A894413085C_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_2F8A6686_0D4F_6B71_4174_A02FE43588D3_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundOpacity": 1,
 "shadowColor": "#000000",
 "right": "5%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "shadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "layout": "absolute",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "bottom": "5%",
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "verticalAlign": "top",
 "propagateClick": false,
 "shadowSpread": 1,
 "overflow": "visible",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadowOpacity": 0.3,
 "data": {
  "name": "Global"
 },
 "shadowBlurRadius": 25
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9A79123D_BC3B_157C_41C1_B207E716906B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3499,
   "height": 2514
  },
  {
   "url": "media/popup_9A79123D_BC3B_157C_41C1_B207E716906B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1471
  },
  {
   "url": "media/popup_9A79123D_BC3B_157C_41C1_B207E716906B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 735
  },
  {
   "url": "media/popup_9A79123D_BC3B_157C_41C1_B207E716906B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 367
  }
 ],
 "id": "ImageResource_A9AE9E76_BF1F_4E80_41D4_CB3F61335F18"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1666,
   "height": 2088
  },
  {
   "url": "media/popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1634,
   "height": 2048
  },
  {
   "url": "media/popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 817,
   "height": 1024
  },
  {
   "url": "media/popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 408,
   "height": 512
  }
 ],
 "id": "ImageResource_A9D62E9D_BF1F_4F80_41DA_685A529E76F8"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2326,
   "height": 2866
  },
  {
   "url": "media/popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1662,
   "height": 2047
  },
  {
   "url": "media/popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 831,
   "height": 1023
  },
  {
   "url": "media/popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 415,
   "height": 511
  }
 ],
 "id": "ImageResource_A9F74EBC_BF1F_4F80_419E_4CDD454BD837"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.16,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 831,
    "height": 1023
   }
  ]
 },
 "pitch": 11.2,
 "popupMaxWidth": "95%",
 "yaw": 123.76,
 "showDuration": 500
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "class": "HTMLText",
 "id": "HTMLText_BD876AD4_9478_3C4B_41D6_3C886AE845B6_mobile",
 "width": "100%",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#04A3E1",
 "minHeight": 1,
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "paddingBottom": 10,
 "scrollBarOpacity": 0,
 "height": "16.06%",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "HTMLText18899"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vh; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#0000ff;font-size:3.52vh;font-family:'Oswald';\"><B>Visita PY - Paraguay en 360\u00ba</B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.17vh;\"><BR STYLE=\"letter-spacing:0vh; white-space:pre-wrap;color:#000000;font-size:0.86vh;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:right;\"><SPAN STYLE=\"letter-spacing:0vh; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#333333;font-size:2.34vh;font-family:'Oswald';\"><B>por Rholand Bucci</B></SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_6658C838_74AF_8B5A_418E_C797984D8CAE_mobile",
 "width": 40,
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_6658C838_74AF_8B5A_418E_C797984D8CAE.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 40,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_6658C838_74AF_8B5A_418E_C797984D8CAE_pressed.png",
 "data": {
  "name": "IconButton Sound"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.87,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1023,
    "height": 1023
   }
  ]
 },
 "pitch": 5.87,
 "popupMaxWidth": "95%",
 "yaw": -45.45,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.57,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 939,
    "height": 1024
   }
  ]
 },
 "pitch": 1.26,
 "popupMaxWidth": "95%",
 "yaw": -10.07,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Hall - Sala de Obras - Museo del Cabildo",
 "id": "panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD",
 "adjacentPanoramas": [
  {
   "backwardYaw": 14.99,
   "class": "AdjacentPanorama",
   "yaw": -90.77,
   "distance": 1,
   "panorama": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2"
  },
  {
   "backwardYaw": -0.2,
   "class": "AdjacentPanorama",
   "yaw": -89.01,
   "distance": 1,
   "panorama": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084"
  },
  {
   "backwardYaw": -179.84,
   "class": "AdjacentPanorama",
   "yaw": 92.09,
   "distance": 1,
   "panorama": "this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_AB145AF5_BC55_150C_4195_2268B618F25E",
  "this.overlay_ABA66A51_BC55_1504_41C0_0C906CD039BC",
  "this.overlay_A4648909_BC55_1704_41C9_0E9B81E1FF4C",
  "this.overlay_A5B7CFE0_BC55_0B03_41B4_9DE09025A9C6",
  "this.popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957",
  "this.overlay_A4F36C2A_BC55_0D04_41E4_BCE454120120",
  "this.overlay_A4C8E1FC_BC5B_36FC_41E3_9A88F6E1BD76",
  "this.overlay_A4A4C413_BC5B_FD04_41DB_AA056715BAD5",
  "this.popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4",
  "this.popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E"
 ],
 "hfovMax": 130
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 0, 1)",
   "media": "this.panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 1, 2)",
   "media": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 2, 3)",
   "media": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 3, 4)",
   "media": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 4, 5)",
   "media": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 5, 6)",
   "media": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 6, 7)",
   "media": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 7, 8)",
   "media": "this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 8, 9)",
   "media": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 9, 10)",
   "media": "this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 10, 11)",
   "media": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 11, 12)",
   "media": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 12, 13)",
   "media": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 13, 14)",
   "media": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 14, 15)",
   "media": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist, 15, 0)",
   "media": "this.panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_camera"
  }
 ],
 "id": "ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile_playlist"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A83688E7_BF1F_7380_41E6_D62DE23741B5",
 "id": "camera_A836B8E7_BF1F_7380_41E6_2176F6537E72",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -23.9,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.67,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 792,
    "height": 1023
   }
  ]
 },
 "pitch": 15.06,
 "popupMaxWidth": "95%",
 "yaw": 57.13,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_mobile",
 "rollOverIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_rollover.png",
 "width": "14.22%",
 "maxWidth": 60,
 "right": 10,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "top": "20%",
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "bottom": "20%",
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_pressed.png",
 "data": {
  "name": "IconButton >"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_7DB3C373_7065_34DE_41BA_CF5206137DED_mobile",
  "this.Container_7DB3F373_7065_34CE_41B4_E77DDA40A4F3_mobile",
  "this.Container_7DBCC382_7065_343F_41D5_9D3C36B5F479_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DB20382_7065_343F_4186_6E0B0B3AFF36_mobile",
 "left": "0%",
 "width": 400,
 "backgroundColorRatios": [
  0
 ],
 "gap": 10,
 "horizontalAlign": "left",
 "layout": "absolute",
 "paddingLeft": 40,
 "paddingRight": 40,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderSize": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 40,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container"
 },
 "paddingTop": 40,
 "backgroundOpacity": 0.7
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A880B9B7_BF1F_7580_41E5_D3B8F495E81B",
 "id": "camera_A880A9B7_BF1F_7580_41C9_44486825D046",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -0.73,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.01,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A62FF904_BCCB_170C_41E6_F995F1691FDC",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A62FF904_BCCB_170C_41E6_F995F1691FDC_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 875,
    "height": 1024
   }
  ]
 },
 "pitch": 6.77,
 "popupMaxWidth": "95%",
 "yaw": -150.19,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2292,
   "height": 1710
  },
  {
   "url": "media/popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1527
  },
  {
   "url": "media/popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 763
  },
  {
   "url": "media/popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 381
  }
 ],
 "id": "ImageResource_A9A04E6C_BF1F_4E80_41E2_2B5E086FB8FF"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2434,
   "height": 3094
  },
  {
   "url": "media/popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1611,
   "height": 2048
  },
  {
   "url": "media/popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 805,
   "height": 1024
  },
  {
   "url": "media/popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 402,
   "height": 512
  }
 ],
 "id": "ImageResource_A9BECE85_BF1F_4F80_41D0_E4A0293CEB62"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_9E9D37CB_BF1F_7D87_41E4_986DCDAF5AF2",
 "id": "camera_9E9D27CA_BF1F_7D81_419F_E978FAA47B4A",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 90.99,
  "pitch": 0
 }
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Obras",
 "id": "panorama_B599D066_B8D2_BE35_41E3_25891358CFE5",
 "adjacentPanoramas": [
  {
   "backwardYaw": 176.82,
   "class": "AdjacentPanorama",
   "yaw": -85.06,
   "distance": 1,
   "panorama": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3"
  },
  {
   "backwardYaw": 92.09,
   "class": "AdjacentPanorama",
   "yaw": -179.84,
   "distance": 1,
   "panorama": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A4931BD0_BC5D_0B04_41D4_5BD23DA52AC0",
  "this.overlay_A59A21E2_BC5D_3704_41E0_3B7650900A4E",
  "this.overlay_A52FA283_BC5D_7504_41D2_E7FE7D1B7BFC",
  "this.popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3",
  "this.overlay_A50A4F56_BC5F_0B0C_4193_4C2843DFE9AD",
  "this.overlay_A52ADD14_BC5F_0F0C_41E4_0FF0C3FF8957",
  "this.overlay_985A9B7F_BC55_0BFC_41DF_572606765297",
  "this.overlay_A5DB74AC_BC55_3D1C_41E4_6A7384C08D9D",
  "this.overlay_A5EB7BF3_BC4B_0B04_41D3_2B8766F87AA8",
  "this.overlay_A5E95EEC_BC4B_0D1C_41CC_AA621080C6AD",
  "this.overlay_A591FAE2_BC4B_1504_41D8_5048BF5C5BDC",
  "this.overlay_A6318D4E_BC4B_0F1C_41D3_E557F6943ECB",
  "this.overlay_A5C0AC40_BC3B_0D04_41E1_E5619AAB4C31",
  "this.overlay_A67D7315_BC3D_1B0C_41E0_B9690B12C111",
  "this.popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9",
  "this.popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554",
  "this.popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F",
  "this.popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0",
  "this.popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414",
  "this.popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747",
  "this.popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E",
  "this.popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B",
  "this.popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00",
  "this.popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC"
 ],
 "hfovMax": 130
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_BD140CC8_9478_145B_41BD_F96EEC163BAF_mobile",
 "rollOverIconURL": "skin/IconButton_BD140CC8_9478_145B_41BD_F96EEC163BAF_rollover.jpg",
 "width": "25%",
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_BD140CC8_9478_145B_41BD_F96EEC163BAF.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "height": "75%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_BD141CC8_9478_145B_41D4_265F47E47DB6_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_BD140CC8_9478_145B_41BD_F96EEC163BAF_pressed.jpg",
 "data": {
  "name": "X"
 },
 "shadow": false,
 "pressedRollOverIconURL": "skin/IconButton_BD140CC8_9478_145B_41BD_F96EEC163BAF_pressed_rollover.jpg",
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96_mobile",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 58,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96_pressed.png",
 "data": {
  "name": "IconButton HS "
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A876099A_BF1F_7580_4183_AA59A55ADE78",
 "id": "camera_A876399A_BF1F_7580_41BD_7FFA2964AA39",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 179.33,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.46,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A63929AC_BCCD_171C_41D7_6988B9694168",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A63929AC_BCCD_171C_41D7_6988B9694168_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 875,
    "height": 1024
   }
  ]
 },
 "pitch": 3.24,
 "popupMaxWidth": "95%",
 "yaw": -22.04,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1281E_B8EE_8E14_41D2_E400F34ECC94",
 "id": "panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "maxHeight": 50,
 "class": "IconButton",
 "id": "IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4_mobile",
 "left": "84%",
 "maxWidth": 50,
 "right": "-3.25%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4.png",
 "rollOverIconURL": "skin/IconButton_7DB21382_7065_343F_41B1_484EDBCD16A4_rollover.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "top": "47%",
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "bottom": "48%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "middle",
 "data": {
  "name": "IconButton collapse"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3198,
   "height": 2450
  },
  {
   "url": "media/popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1568
  },
  {
   "url": "media/popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 784
  },
  {
   "url": "media/popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 392
  }
 ],
 "id": "ImageResource_A9F56EBE_BF1F_4F80_41D7_0D8C01EA8EEB"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.65,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9A79123D_BC3B_157C_41C1_B207E716906B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9A79123D_BC3B_157C_41C1_B207E716906B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 735
   }
  ]
 },
 "pitch": -28.42,
 "popupMaxWidth": "95%",
 "yaw": 45.65,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5B14704_BC3B_1B03_417B_D212E161463C_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2225,
   "height": 2926
  },
  {
   "url": "media/popup_A5B14704_BC3B_1B03_417B_D212E161463C_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1557,
   "height": 2048
  },
  {
   "url": "media/popup_A5B14704_BC3B_1B03_417B_D212E161463C_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 778,
   "height": 1024
  },
  {
   "url": "media/popup_A5B14704_BC3B_1B03_417B_D212E161463C_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 389,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C5FE8E_BF1F_4F80_41D9_F88DEAA84640"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.78,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 837
   }
  ]
 },
 "pitch": 8.1,
 "popupMaxWidth": "95%",
 "yaw": 161.89,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A87879A8_BF1F_7580_41D1_23345701C6D4",
 "id": "camera_A87869A8_BF1F_7580_41E1_2F70CF66940B",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 87.2,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3324,
   "height": 2528
  },
  {
   "url": "media/popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1557
  },
  {
   "url": "media/popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 778
  },
  {
   "url": "media/popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 389
  }
 ],
 "id": "ImageResource_A9B70E7C_BF1F_4E80_41CD_8EC8BEFB68AD"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1981E_B8EE_8E14_41E4_85986390B089",
 "id": "panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_mobile",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 58,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_pressed.png",
 "data": {
  "name": "IconButton GYRO"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_9E48077F_BF1F_7D7F_41D5_63E0BDD64027",
 "id": "camera_9E48377E_BF1F_7D7E_41E4_318E756FA2A2",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -177.6,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1903,
   "height": 2299
  },
  {
   "url": "media/popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1695,
   "height": 2048
  },
  {
   "url": "media/popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 847,
   "height": 1024
  },
  {
   "url": "media/popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 423,
   "height": 512
  }
 ],
 "id": "ImageResource_A9EC7EB6_BF1F_4F80_41DC_EBA86CE60739"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 8.89,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9017E552_BC37_7F04_41A5_19434122D6E1",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9017E552_BC37_7F04_41A5_19434122D6E1_0_3.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 682
   }
  ]
 },
 "pitch": -15.67,
 "popupMaxWidth": "95%",
 "yaw": 142.28,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_AFE5D9D2_BD16_CF5E_41D0_197771C3DC13",
  "this.HTMLText_BD872AD4_9478_3C4B_41E0_004DEE953DF2_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD870AD4_9478_3C4B_41D4_7C5B5C74D90A_mobile",
 "layout": "horizontal",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 1,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "23.153%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "- content"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A89109D6_BF1F_7580_41C1_5B96324C87B3",
 "id": "camera_A89139D6_BF1F_7580_41E4_246B17AB4D82",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -0.83,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 4800,
   "height": 3200
  },
  {
   "url": "media/popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 4096,
   "height": 2730
  },
  {
   "url": "media/popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1365
  },
  {
   "url": "media/popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 682
  },
  {
   "url": "media/popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB_0_4.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 341
  }
 ],
 "id": "ImageResource_A9A57E6E_BF1F_4E80_41D9_A77497B652A2"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3255,
   "height": 2601
  },
  {
   "url": "media/popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1636
  },
  {
   "url": "media/popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 818
  },
  {
   "url": "media/popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 409
  }
 ],
 "id": "ImageResource_A9E41EAD_BF1F_4F80_41D2_117BD867FD31"
},
{
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "id": "MapViewer_mobile",
 "left": 0,
 "width": "100%",
 "progressBackgroundColorDirection": "vertical",
 "playbackBarBottom": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "progressBorderColor": "#FFFFFF",
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "minWidth": 1,
 "playbackBarHeadWidth": 6,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipFontStyle": "normal",
 "height": "99.975%",
 "progressBorderSize": 0,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadShadowColor": "#000000",
 "propagateClick": false,
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "toolTipFontWeight": "normal",
 "toolTipFontFamily": "Arial",
 "playbackBarProgressBorderSize": 0,
 "progressBottom": 2,
 "toolTipPaddingBottom": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipPaddingTop": 4,
 "shadow": false,
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "toolTipFontSize": 12,
 "progressHeight": 10,
 "playbackBarHeadHeight": 15,
 "progressRight": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "toolTipBackgroundColor": "#F6F6F6",
 "playbackBarLeft": 0,
 "progressLeft": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarBorderRadius": 0,
 "playbackBarRight": 0,
 "borderRadius": 0,
 "toolTipBorderSize": 1,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressOpacity": 1,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarOpacity": 1,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipOpacity": 1,
 "playbackBarBorderSize": 0,
 "top": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontColor": "#606060",
 "progressBackgroundColorRatios": [
  0.01
 ],
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "paddingBottom": 0,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBarBorderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "progressBarBackgroundColorDirection": "vertical",
 "vrPointerSelectionColor": "#FF6600",
 "toolTipTextShadowBlurRadius": 3,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBarBackgroundColorRatios": [
  0
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "data": {
  "name": "Floor Plan"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarHeadShadow": true,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "transitionMode": "blending"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.92,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 831,
    "height": 1023
   }
  ]
 },
 "pitch": 3.99,
 "popupMaxWidth": "95%",
 "yaw": 165.85,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.53,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 778
   }
  ]
 },
 "pitch": 7.67,
 "popupMaxWidth": "95%",
 "yaw": 147.87,
 "showDuration": 500
},
{
 "width": 4108,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AE748E57_BEE9_CE80_41D5_9AE4A8AFDAC4.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AE748E57_BEE9_CE80_41D5_9AE4A8AFDAC4",
 "height": 3145
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.74,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 828,
    "height": 1024
   }
  ]
 },
 "pitch": 12.54,
 "popupMaxWidth": "95%",
 "yaw": -120.8,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 99.08,
    "targetYaw": 0,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 198.07,
    "yawSpeed": 198.07,
    "path": "shortest",
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 0.13,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 29.46
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 101.62,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -4.96
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 123.73,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -11.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -122.97,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 33.25,
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -105.89,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -91.57,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.21
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_9EADB7DB_BF1F_7D87_41C7_0407632EE83D",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 180,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.77,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7257AA0_BCDA_F504_41B5_0019559949D5",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7257AA0_BCDA_F504_41B5_0019559949D5_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 875,
    "height": 1024
   }
  ]
 },
 "pitch": 4.91,
 "popupMaxWidth": "95%",
 "yaw": -29.76,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Obras - Escaleras",
 "id": "panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3",
 "adjacentPanoramas": [
  {
   "backwardYaw": -85.06,
   "class": "AdjacentPanorama",
   "yaw": 176.82,
   "distance": 1,
   "panorama": "this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5"
  },
  {
   "backwardYaw": 179.17,
   "class": "AdjacentPanorama",
   "yaw": -93.01,
   "distance": 1,
   "panorama": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA"
  },
  {
   "backwardYaw": 179.98,
   "class": "AdjacentPanorama",
   "yaw": -92.72,
   "distance": 1,
   "panorama": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4"
  },
  {
   "backwardYaw": -177.6,
   "class": "AdjacentPanorama",
   "yaw": -92.8,
   "distance": 1,
   "panorama": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A6674F6C_BC3F_0B1C_41A8_5C318FCE1E92",
  "this.overlay_A71EF648_BC3F_1D04_41E3_693DCDF2B956",
  "this.popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD",
  "this.overlay_A653AB05_BC3D_0B0C_41C9_5214ACE33543",
  "this.overlay_A652D39D_BC3D_1B3C_41DF_667C91A31F05",
  "this.overlay_A67AE874_BC3B_150C_41C9_CA5AADD64AD4",
  "this.overlay_A629C9A5_BC3B_170C_41B2_F7BC68977A34",
  "this.overlay_A5A51734_BC3B_1B03_41C7_0A0ECFF258D7",
  "this.overlay_A712B940_BC35_3704_41E0_AF16CE58FAA4",
  "this.overlay_A5DE68BE_BC35_157C_41E1_6C84B9D29DA9",
  "this.overlay_A6D7087D_BC35_75FD_41CB_B82CB0043F09",
  "this.popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706",
  "this.popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81",
  "this.popup_A5875843_BC3B_1504_41CF_71FD3606FBC4",
  "this.popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0",
  "this.popup_A5B14704_BC3B_1B03_417B_D212E161463C",
  "this.overlay_8D6FB774_BC4B_3B0C_41CC_816828372114",
  "this.overlay_8D11CD44_BC4B_0F0C_41D9_726F4D5492C7",
  "this.overlay_8D0345ED_BC4B_1F1C_41C2_06504EF06B39"
 ],
 "hfovMax": 130
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.3,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 859,
    "height": 1024
   }
  ]
 },
 "pitch": 11.92,
 "popupMaxWidth": "95%",
 "yaw": 80.84,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.53,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 873,
    "height": 1024
   }
  ]
 },
 "pitch": 14.79,
 "popupMaxWidth": "95%",
 "yaw": 60.42,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3920,
   "height": 1408
  },
  {
   "url": "media/popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 735
  },
  {
   "url": "media/popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 367
  },
  {
   "url": "media/popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 183
  }
 ],
 "id": "ImageResource_A9B21E79_BF1F_4E80_41D4_43691F67FB21"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2143,
   "height": 2422
  },
  {
   "url": "media/popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1812,
   "height": 2048
  },
  {
   "url": "media/popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 906,
   "height": 1024
  },
  {
   "url": "media/popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 453,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C98E91_BF1F_4F80_41DD_9A7E555FCB62"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.9,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 783
   }
  ]
 },
 "pitch": 6.37,
 "popupMaxWidth": "95%",
 "yaw": -112,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 108,
    "targetYaw": 0,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 216,
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -23.49,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -9.23
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -72.23,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.79
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -120.21,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.04
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -163.92,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 110.66,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 7.85
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 9.67,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.44
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A74E5AEC_BF1F_7780_41A3_4AD1DB16528E",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 179.8,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.37,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5875843_BC3B_1504_41CF_71FD3606FBC4",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5875843_BC3B_1504_41CF_71FD3606FBC4_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 755,
    "height": 1024
   }
  ]
 },
 "pitch": 7.35,
 "popupMaxWidth": "95%",
 "yaw": 31.84,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_mobile",
 "left": 10,
 "width": "14.22%",
 "maxWidth": 60,
 "rollOverIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_rollover.png",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "top": "20%",
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "bottom": "20%",
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_pressed.png",
 "data": {
  "name": "IconButton <"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "class": "WebFrame",
 "id": "WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA_mobile",
 "width": "100%",
 "backgroundColorRatios": [
  0
 ],
 "scrollEnabled": true,
 "url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7215.428117473143!2d-57.63779412397415!3d-25.280202657720874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xe9a0efd579be0bee!2sCentro%20Cultural%20de%20la%20Rep%C3%BAblica%20-%20El%20Cabildo!5e0!3m2!1ses-419!2spy!4v1583715162283!5m2!1ses-419!2spy",
 "paddingLeft": 0,
 "paddingRight": 0,
 "minHeight": 1,
 "borderSize": 0,
 "minWidth": 1,
 "backgroundColor": [
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "WebFrame48191"
 },
 "shadow": false,
 "paddingTop": 0,
 "insetBorder": false,
 "backgroundOpacity": 1
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 4.59,
    "targetYaw": 0,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 8.22,
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -23.49,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -9.23
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -72.23,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.79
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -120.21,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.04
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -163.92,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 110.66,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 7.85
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 9.67,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.44
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A856794B_BF1F_7280_41DD_28B9A537BD00",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -5.65,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3274,
   "height": 2538
  },
  {
   "url": "media/popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1587
  },
  {
   "url": "media/popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 793
  },
  {
   "url": "media/popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 396
  }
 ],
 "id": "ImageResource_A9CC7E97_BF1F_4F80_41DD_24EE2610BDDC"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.42,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957_0_1.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 948
   }
  ]
 },
 "pitch": 12.16,
 "popupMaxWidth": "95%",
 "yaw": 9.9,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.61,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE_0_3.jpg",
    "class": "ImageResourceLevel",
    "width": 682,
    "height": 1024
   }
  ]
 },
 "pitch": 10.78,
 "popupMaxWidth": "95%",
 "yaw": 0.51,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.54,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 879,
    "height": 1024
   }
  ]
 },
 "pitch": 3.15,
 "popupMaxWidth": "95%",
 "yaw": -163.18,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5FEF81F_B8EE_8E14_41E0_95A1C6C2E1B9",
 "id": "panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "touchControlMode": "drag_rotation",
 "class": "PanoramaPlayer",
 "gyroscopeVerticalDraggingEnabled": true,
 "id": "MainViewer_mobilePanoramaPlayer",
 "mouseControlMode": "drag_rotation",
 "displayPlaybackBar": true,
 "buttonCardboardView": [
  "this.IconButton_66589837_74AF_8B56_41D7_A6F4FAC02CC3_mobile",
  "this.IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB_mobile"
 ],
 "viewerArea": "this.MainViewer_mobile",
 "buttonToggleHotspots": [
  "this.IconButton_6658F838_74AF_8B5A_41C1_8DA59962CFF4_mobile",
  "this.IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96_mobile"
 ],
 "buttonToggleGyroscope": [
  "this.IconButton_6658D838_74AF_8B5A_41D7_154D466041BB_mobile",
  "this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_mobile"
 ]
},
{
 "borderRadius": 0,
 "children": [
  "this.ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C_mobile",
  "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_mobile",
  "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_mobile",
  "this.IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC_mobile",
 "layout": "absolute",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 1,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container photo"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A83C1907_BF1F_7280_41E7_C71A56B1365F",
 "id": "camera_A83C0907_BF1F_7280_41A1_3E50F68DF3B9",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -3.18,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.07,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A72CF2BD_BCD5_157C_418D_12FD770BC899",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A72CF2BD_BCD5_157C_418D_12FD770BC899_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 906,
    "height": 1024
   }
  ]
 },
 "pitch": 3.84,
 "popupMaxWidth": "95%",
 "yaw": -147.78,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2074,
   "height": 2557
  },
  {
   "url": "media/popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1661,
   "height": 2047
  },
  {
   "url": "media/popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 830,
   "height": 1023
  },
  {
   "url": "media/popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 415,
   "height": 511
  }
 ],
 "id": "ImageResource_A9C31E87_BF1F_4F80_41E2_A440E2E62115"
},
{
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0.8,
 "fontSize": "26px",
 "shadowBlurRadius": 6,
 "class": "Button",
 "id": "Button_7DB33382_7065_343F_41B1_0B0F019C1828_mobile",
 "pressedBackgroundOpacity": 1,
 "width": "100%",
 "shadowColor": "#000000",
 "fontFamily": "Oswald",
 "label": "Lista de Perspectivas",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "paddingLeft": 10,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "click": "this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_39DE87B1_0C06_62AF_417B_8CB0FB5C9D15_mobile, true, 0, null, null, false)",
 "borderColor": "#000000",
 "gap": 23,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "height": 60,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "italic",
 "verticalAlign": "middle",
 "propagateClick": true,
 "iconHeight": 32,
 "data": {
  "name": "Button Panorama List"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 32,
 "textDecoration": "none",
 "paddingTop": 0,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 2.68,
    "targetYaw": 72.6,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 4.38,
    "targetPitch": -4.02
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 154.12,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 33.22
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -155.63,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 35.99
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -115.18,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.47
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.88,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A7A46B64_BF1F_7680_41E4_48628DCB8CFE",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 64.11,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 4000,
   "height": 6000
  },
  {
   "url": "media/popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2730,
   "height": 4096
  },
  {
   "url": "media/popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1365,
   "height": 2048
  },
  {
   "url": "media/popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 682,
   "height": 1024
  },
  {
   "url": "media/popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE_0_4.jpg",
   "class": "ImageResourceLevel",
   "width": 341,
   "height": 512
  }
 ],
 "id": "ImageResource_A4012C4C_BD0A_C549_41E1_9CBAF83AC1F0"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -23.49,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -9.23
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -72.23,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.79
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -120.21,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.04
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -163.92,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 110.66,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 7.85
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 9.67,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.44
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "id": "MainViewer_mobile",
 "left": 0,
 "width": "100%",
 "progressBackgroundColorDirection": "vertical",
 "playbackBarBottom": 5,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBorderRadius": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "toolTipPaddingLeft": 10,
 "vrPointerSelectionTime": 2000,
 "progressBorderColor": "#FFFFFF",
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "minWidth": 100,
 "playbackBarHeadWidth": 6,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipFontStyle": "normal",
 "height": "100%",
 "progressBorderSize": 0,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadShadowColor": "#000000",
 "propagateClick": true,
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "toolTipFontWeight": "normal",
 "toolTipFontFamily": "Georgia",
 "playbackBarProgressBorderSize": 0,
 "progressBottom": 0,
 "toolTipPaddingBottom": 7,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipPaddingTop": 7,
 "shadow": false,
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "toolTipFontSize": 13,
 "progressHeight": 10,
 "playbackBarHeadHeight": 15,
 "progressRight": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "toolTipBackgroundColor": "#000000",
 "playbackBarLeft": 0,
 "progressLeft": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarBorderRadius": 0,
 "playbackBarRight": 0,
 "borderRadius": 0,
 "toolTipBorderSize": 1,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressOpacity": 1,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarOpacity": 1,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipOpacity": 0.5,
 "playbackBarBorderSize": 0,
 "top": 0,
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontColor": "#FFFFFF",
 "progressBackgroundColorRatios": [
  0.01
 ],
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipPaddingRight": 10,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "paddingBottom": 0,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBarBorderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "progressBarBackgroundColorDirection": "vertical",
 "vrPointerSelectionColor": "#FF6600",
 "toolTipTextShadowBlurRadius": 3,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBarBackgroundColorRatios": [
  0
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "data": {
  "name": "Main Viewer"
 },
 "toolTipShadowOpacity": 0,
 "playbackBarHeadShadow": true,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "transitionMode": "blending"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 46.8,
    "targetYaw": -2.01,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 93.02,
    "targetPitch": 0.25
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -29.02,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -18.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -89.31,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.19
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -131.51,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -161.41,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.95
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 81.77,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -8.73
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A8A97A0A_BF1F_7680_41CE_879E8B6EFFE0",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -96.28,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.71,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 917,
    "height": 1024
   }
  ]
 },
 "pitch": 4.09,
 "popupMaxWidth": "95%",
 "yaw": -125.21,
 "showDuration": 500
},
{
 "visible": false,
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB_mobile",
 "rollOverIconURL": "skin/IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB_rollover.png",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "height": 58,
 "paddingBottom": 0,
 "propagateClick": true,
 "verticalAlign": "middle",
 "data": {
  "name": "IconButton VR"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.65,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A772B107_BC35_170D_41E5_20064B709D84",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A772B107_BC35_170D_41E5_20064B709D84_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 947,
    "height": 1024
   }
  ]
 },
 "pitch": 6.68,
 "popupMaxWidth": "95%",
 "yaw": -103.05,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A8BC5A26_BF1F_7680_41DD_BCCE3D9E6A97",
 "id": "camera_A8BC4A26_BF1F_7680_41D0_B02A6CA8F6E5",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -10.62,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3920,
   "height": 1408
  },
  {
   "url": "media/popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 735
  },
  {
   "url": "media/popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 367
  },
  {
   "url": "media/popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 183
  }
 ],
 "id": "ImageResource_A9A75E6D_BF1F_4E80_41E1_B70586E22392"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 4800,
   "height": 3200
  },
  {
   "url": "media/popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 4096,
   "height": 2730
  },
  {
   "url": "media/popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1365
  },
  {
   "url": "media/popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 682
  },
  {
   "url": "media/popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4_0_4.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 341
  }
 ],
 "id": "ImageResource_A9B01E7B_BF1F_4E80_41CC_C2E81E1F1300"
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_mobile",
 "rollOverIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_rollover.jpg",
 "width": "10%",
 "maxWidth": 60,
 "right": 20,
 "horizontalAlign": "right",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "top": 20,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "height": "10%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "pressedIconURL": "skin/IconButton_2A19CC4C_0D3B_DFF0_41AA_D2AC34177CF1_pressed.jpg",
 "data": {
  "name": "IconButton X"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 80.19,
    "targetYaw": -2.01,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 160.11,
    "targetPitch": 0.25
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -29.02,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -18.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -89.31,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.19
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -131.51,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -161.41,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.95
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 81.77,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -8.73
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A7355ACF_BF1F_7780_41D4_62FA800490DB",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -165.01,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.44,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 818
   }
  ]
 },
 "pitch": 3.27,
 "popupMaxWidth": "95%",
 "yaw": 175.28,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3290,
   "height": 2786
  },
  {
   "url": "media/popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1734
  },
  {
   "url": "media/popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 867
  },
  {
   "url": "media/popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 433
  }
 ],
 "id": "ImageResource_A9D17E9A_BF1F_4F80_4147_622AAE863222"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2838,
   "height": 3666
  },
  {
   "url": "media/popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1585,
   "height": 2047
  },
  {
   "url": "media/popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 792,
   "height": 1023
  },
  {
   "url": "media/popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 396,
   "height": 511
  }
 ],
 "id": "ImageResource_A9C0EE8B_BF1F_4F80_41AE_3D39159E453F"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A76DEB19_BF1F_7680_41E4_8C58C59F6352",
 "id": "camera_A76D9B19_BF1F_7680_41BD_6C1489F91983",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 89.23,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.8,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9BB5C075_BC35_150C_41D5_56C7BD185F99",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9BB5C075_BC35_150C_41D5_56C7BD185F99_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 2048,
    "height": 1567
   }
  ]
 },
 "pitch": -21.76,
 "popupMaxWidth": "95%",
 "yaw": 58.84,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Exposiciones Temporarias - Punta",
 "id": "panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA",
 "adjacentPanoramas": [
  {
   "backwardYaw": 179.91,
   "class": "AdjacentPanorama",
   "yaw": -2.77,
   "distance": 1,
   "panorama": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4"
  },
  {
   "backwardYaw": -93.01,
   "class": "AdjacentPanorama",
   "yaw": 179.17,
   "distance": 1,
   "panorama": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3"
  },
  {
   "backwardYaw": -177.61,
   "class": "AdjacentPanorama",
   "yaw": -2.84,
   "distance": 1,
   "panorama": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A7252576_BC35_1F0C_41DB_0CC73054CE75",
  "this.popup_A772B107_BC35_170D_41E5_20064B709D84",
  "this.overlay_A6945E0E_BC35_0D1C_41D5_C169D635CECD",
  "this.overlay_A6CCE463_BC35_1D04_41DA_92EE30967B44",
  "this.overlay_A77D8116_BC35_170C_41E0_3962F804B519",
  "this.overlay_A63BE931_BCCB_1704_41DB_B9CA165B01BA",
  "this.overlay_A7A9F53F_BCCB_3F7C_4188_CF428F838435",
  "this.overlay_A7C40D8E_BCCB_0F1C_41CD_53FC4BFABC4C",
  "this.overlay_A65EDB33_BCCB_0B04_41E1_B7D4CD1EA83B",
  "this.overlay_A7A4435E_BCCD_1B3C_41CF_7543AC3F0217",
  "this.overlay_A7A107D7_BCCD_3B0C_41D0_AB4CA5B3781A",
  "this.overlay_A6467291_BCCD_3504_41D8_BC54798DA583",
  "this.overlay_A78C0393_BCCD_1B04_41AE_F9E792BFC46E",
  "this.overlay_A64612FF_BCCF_1AFC_41BF_55CB326FB9A5",
  "this.overlay_A790FF49_BCCF_0B04_41CC_61638F8FFF9E",
  "this.overlay_A7B81D3C_BCCF_0F7C_41E7_4A4BBC85CD54",
  "this.overlay_A7A719E4_BCCD_170C_4191_4BEE3DB59DD1",
  "this.overlay_A655A118_BCCD_3704_41E2_755CEEF492B1",
  "this.overlay_A64549D8_BCCD_1704_41E1_EEA9B1B528CE",
  "this.overlay_A65274DB_BCCD_1D04_41CA_03B6974DDA14",
  "this.overlay_A65BCA64_BCCB_1503_41E0_406758F520F2",
  "this.overlay_A2DFA5A9_BCCB_FF05_41E5_7BF03107D950",
  "this.overlay_A7273DA4_BCD5_0F0C_41C2_30059EBEDE3E",
  "this.overlay_A3BCDC5D_BCD7_0D3C_41E4_06620DACB4D0",
  "this.popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1",
  "this.popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507",
  "this.popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B",
  "this.popup_A62FF904_BCCB_170C_41E6_F995F1691FDC",
  "this.popup_A79DC513_BCCB_3F04_41C6_F86CA962705F",
  "this.popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9",
  "this.popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321",
  "this.popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8",
  "this.popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6",
  "this.popup_A63A7264_BCCD_350C_41CC_1C3A43E75878",
  "this.popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D",
  "this.popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF",
  "this.popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB",
  "this.popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B",
  "this.popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606",
  "this.popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D",
  "this.popup_A63929AC_BCCD_171C_41D7_6988B9694168",
  "this.popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640",
  "this.popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE",
  "this.overlay_8DCDA550_BC4D_1F04_41C5_8EC12977C931",
  "this.overlay_8DE5DB02_BC4D_0B07_41D1_E2EDAFEFB9D7",
  "this.overlay_8DE84E8D_BC4D_0D1C_41C2_A51D16CBD855",
  "this.overlay_8D9414D0_BC4D_7D04_41E3_00E9B3DAF742"
 ],
 "hfovMax": 130
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7DB3E382_7065_343F_41C2_E1E6BB5BA055_mobile",
  "this.Button_7DB31382_7065_343F_41D6_641BBE1B2562_mobile",
  "this.Container_7DB30382_7065_343F_416C_8610BCBA9F50_mobile",
  "this.Button_7DB33382_7065_343F_41B1_0B0F019C1828_mobile",
  "this.Container_7DB32382_7065_343F_419E_6594814C420F_mobile",
  "this.Button_7DB35382_7065_343F_41C5_CF0EAF3E4CFF_mobile",
  "this.Container_7DB34382_7065_343F_41CB_A5B96E9749EE_mobile",
  "this.Button_7DB37382_7065_343F_41CC_EC41ABCCDE1B_mobile",
  "this.Container_7DBC9382_7065_343F_41CC_ED357655BB95_mobile",
  "this.Button_7DBC8382_7065_343F_4183_17B44518DB40_mobile",
  "this.Container_7DBCB382_7065_343F_41D8_AB382D384291_mobile",
  "this.Button_7DBCA382_7065_343F_41DB_48D975E3D9EC_mobile",
  "this.Container_7DBCD382_7065_343F_41D8_FC14DFF91DA9_mobile"
 ],
 "class": "Container",
 "id": "Container_7DB3F373_7065_34CE_41B4_E77DDA40A4F3_mobile",
 "width": "100%",
 "right": "0%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "gap": 0,
 "layout": "vertical",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "25%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "25%",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "propagateClick": true,
 "verticalAlign": "middle",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "-Container buttons"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.51,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 906,
    "height": 1024
   }
  ]
 },
 "pitch": 2.46,
 "popupMaxWidth": "95%",
 "yaw": -159.32,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.01,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 873,
    "height": 1024
   }
  ]
 },
 "pitch": 4.55,
 "popupMaxWidth": "95%",
 "yaw": 12.24,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.58,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 847,
    "height": 1024
   }
  ]
 },
 "pitch": 4.15,
 "popupMaxWidth": "95%",
 "yaw": -24.63,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0.8,
 "fontSize": "26px",
 "shadowBlurRadius": 6,
 "class": "Button",
 "id": "Button_7DBCA382_7065_343F_41DB_48D975E3D9EC_mobile",
 "pressedBackgroundOpacity": 1,
 "width": "100%",
 "shadowColor": "#000000",
 "fontFamily": "Oswald",
 "label": "Informaci\u00f3n de Contacto",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "paddingLeft": 10,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "click": "this.setComponentVisibility(this.Container_BD84EAD4_9478_3C4B_41C0_BDBA5096F748_mobile, true, 0, null, null, false); this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false)",
 "borderColor": "#000000",
 "gap": 5,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "height": 60,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "italic",
 "verticalAlign": "middle",
 "propagateClick": true,
 "iconHeight": 32,
 "data": {
  "name": "Button Contact"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 32,
 "textDecoration": "none",
 "paddingTop": 0,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A8463918_BF1F_7280_41B5_026AB8A04BA1",
 "id": "camera_A8462918_BF1F_7280_41DB_08BCD771B817",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -87.91,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 8.88,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB_0_3.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 682
   }
  ]
 },
 "pitch": -15.92,
 "popupMaxWidth": "95%",
 "yaw": 16.68,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.WebFrame_22F9EEFF_0C1A_2293_4165_411D4444EFEA_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_221C1648_0C06_E5FD_4180_8A2E8B66315E_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundOpacity": 1,
 "shadowColor": "#000000",
 "right": "5%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "shadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "layout": "horizontal",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "bottom": "5%",
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "verticalAlign": "top",
 "propagateClick": false,
 "shadowSpread": 1,
 "overflow": "scroll",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadowOpacity": 0.3,
 "data": {
  "name": "Global"
 },
 "shadowBlurRadius": 25
},
{
 "width": 3920,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B1435CAC_BEEF_3381_41D0_75330430225B.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B1435CAC_BEEF_3381_41D0_75330430225B",
 "height": 1408
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 99.75,
    "targetYaw": 0,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 199.43,
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 19.97,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -19.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 98.35,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 12.12
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 48.61,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 5.34
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -36.3,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -0.94
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.63,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A8E90A64_BF1F_7680_41CF_7CD18FBE1ADE",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 172.97,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A63A7264_BCCD_350C_41CC_1C3A43E75878_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3148,
   "height": 2402
  },
  {
   "url": "media/popup_A63A7264_BCCD_350C_41CC_1C3A43E75878_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1562
  },
  {
   "url": "media/popup_A63A7264_BCCD_350C_41CC_1C3A43E75878_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 781
  },
  {
   "url": "media/popup_A63A7264_BCCD_350C_41CC_1C3A43E75878_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 390
  }
 ],
 "id": "ImageResource_A9D24E99_BF1F_4F80_41DB_C621D60A724B"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2062,
   "height": 3109
  },
  {
   "url": "media/popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1358,
   "height": 2048
  },
  {
   "url": "media/popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 679,
   "height": 1024
  },
  {
   "url": "media/popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 339,
   "height": 512
  }
 ],
 "id": "ImageResource_A9A2FE6B_BF1F_4E80_41C8_2E73D105D2F9"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.46,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 688
   }
  ]
 },
 "pitch": 9.5,
 "popupMaxWidth": "95%",
 "yaw": 131.76,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2078,
   "height": 2320
  },
  {
   "url": "media/popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1834,
   "height": 2048
  },
  {
   "url": "media/popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 917,
   "height": 1024
  },
  {
   "url": "media/popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 458,
   "height": 512
  }
 ],
 "id": "ImageResource_A9F80EC3_BF1F_4F80_41B7_AA0CE87A3190"
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_mobile",
 "rollOverIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_rollover.jpg",
 "width": "25%",
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "height": "75%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_221B1648_0C06_E5FD_417F_E6FCCCB4A6D7_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_pressed.jpg",
 "data": {
  "name": "X"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2326,
   "height": 2866
  },
  {
   "url": "media/popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1662,
   "height": 2047
  },
  {
   "url": "media/popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 831,
   "height": 1023
  },
  {
   "url": "media/popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 415,
   "height": 511
  }
 ],
 "id": "ImageResource_A9CD4E96_BF1F_4F80_41E3_7946DBFD2044"
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.IconButton_EF8F8BD8_E386_8E02_41D6_310FF1964329_mobile"
 ],
 "class": "Container",
 "id": "Container_EF8F8BD8_E386_8E02_41E5_FC5C5513733A_mobile",
 "width": 110,
 "right": "0%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "gap": 10,
 "layout": "horizontal",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "height": 110,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "verticalAlign": "middle",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "button menu sup"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 18.56,
    "targetYaw": 72.6,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 36.28,
    "targetPitch": -4.02
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 154.12,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 33.22
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -155.63,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 35.99
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -115.18,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.47
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.88,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A8FC2A81_BF1F_7780_41E5_CEA1E269BA5A",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 170.57,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.02,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 784,
    "height": 1024
   }
  ]
 },
 "pitch": 16.92,
 "popupMaxWidth": "95%",
 "yaw": 93.02,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1934,
   "height": 1791
  },
  {
   "url": "media/popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 948
  },
  {
   "url": "media/popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 474
  }
 ],
 "id": "ImageResource_A9B69E7D_BF1F_4E80_41DB_07D87A87CBB9"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2143,
   "height": 2422
  },
  {
   "url": "media/popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1812,
   "height": 2048
  },
  {
   "url": "media/popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 906,
   "height": 1024
  },
  {
   "url": "media/popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 453,
   "height": 512
  }
 ],
 "id": "ImageResource_A9FE1EC6_BF1F_4F80_41E4_FB5117E02AAE"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 48.37,
    "targetYaw": 0,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 96.19,
    "yawSpeed": 96.19,
    "path": "shortest",
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 0.13,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 29.46
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 101.62,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -4.96
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 123.73,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -11.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -122.97,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 33.25,
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -105.89,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -91.57,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.21
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_9E7EB7AD_BF1F_7D83_41DC_B4656ED234E5",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 86.94,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD84DAD4_9478_3C4B_41D9_38F6A3F8328B_mobile",
 "layout": "horizontal",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": 370,
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": 40,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container space"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A79DC513_BCCB_3F04_41C6_F86CA962705F_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2078,
   "height": 2320
  },
  {
   "url": "media/popup_A79DC513_BCCB_3F04_41C6_F86CA962705F_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1834,
   "height": 2048
  },
  {
   "url": "media/popup_A79DC513_BCCB_3F04_41C6_F86CA962705F_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 917,
   "height": 1024
  },
  {
   "url": "media/popup_A79DC513_BCCB_3F04_41C6_F86CA962705F_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 458,
   "height": 512
  }
 ],
 "id": "ImageResource_A9CF4E94_BF1F_4F80_41D4_1E32C3F4AC1A"
},
{
 "borderRadius": 0,
 "maxHeight": 1236,
 "class": "Image",
 "id": "Image_AFE5D9D2_BD16_CF5E_41D0_197771C3DC13",
 "width": "24.129%",
 "maxWidth": 936,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "url": "skin/Image_BD873AD4_9478_3C4B_41E1_8CD5E779D6D2.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "height": "100%",
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "top",
 "scaleMode": "fit_inside",
 "data": {
  "name": "Image5134"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCF2E86E_BC3F_351D_41D9_B749614844E0.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCF2E86E_BC3F_351D_41D9_B749614844E0.ogg"
 },
 "id": "audio_FCF2E86E_BC3F_351D_41D9_B749614844E0",
 "data": {
  "label": "Asunci\u00f3n -  Luis Alberto del Paran\u00e1"
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2296,
   "height": 2502
  },
  {
   "url": "media/popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1879,
   "height": 2048
  },
  {
   "url": "media/popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 939,
   "height": 1024
  },
  {
   "url": "media/popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 469,
   "height": 512
  }
 ],
 "id": "ImageResource_A9E0CEAB_BF1F_4F80_41DA_73621316361E"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.2,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 879,
    "height": 1024
   }
  ]
 },
 "pitch": 4.78,
 "popupMaxWidth": "95%",
 "yaw": -156.38,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala Carlos Antonio L\u00f3pez",
 "id": "panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4",
 "adjacentPanoramas": [
  {
   "backwardYaw": 0,
   "class": "AdjacentPanorama",
   "yaw": -179.87,
   "distance": 1,
   "panorama": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_B256E7B0_BC35_1B04_41D4_CEC74C297BEF"
 ],
 "hfovMax": 130
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 20.17,
    "targetYaw": 72.6,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 39.51,
    "targetPitch": -4.02
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 154.12,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 33.22
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -155.63,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 35.99
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -115.18,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.47
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.88,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A82E98CA_BF1F_7380_41C2_5941B8ACDBDA",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 179.56,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2342,
   "height": 2739
  },
  {
   "url": "media/popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1751,
   "height": 2048
  },
  {
   "url": "media/popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 875,
   "height": 1024
  },
  {
   "url": "media/popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 437,
   "height": 512
  }
 ],
 "id": "ImageResource_A9DDAEA7_BF1F_4F80_41E4_DD9DF9E066A0"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -29.02,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -18.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -89.31,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.19
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -131.51,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -161.41,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.95
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 81.77,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -8.73
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -2.01,
  "pitch": 0.25
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1962,
   "height": 2284
  },
  {
   "url": "media/popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1759,
   "height": 2048
  },
  {
   "url": "media/popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 879,
   "height": 1024
  },
  {
   "url": "media/popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 439,
   "height": 512
  }
 ],
 "id": "ImageResource_A9DE9EA6_BF1F_4F80_41CA_AA0C5B4A81A3"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A72F1ABF_BF1F_7780_41C4_D385D521BD34",
 "id": "camera_A72F0ABF_BF1F_7780_41D1_0A3013C7497E",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 2.39,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.08,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 793
   }
  ]
 },
 "pitch": 4.95,
 "popupMaxWidth": "95%",
 "yaw": 119.22,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.02,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 879,
    "height": 1024
   }
  ]
 },
 "pitch": 8.48,
 "popupMaxWidth": "95%",
 "yaw": -138.25,
 "showDuration": 500
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.Container_7DB2F382_7065_343F_41C8_85C6AE9C717F_mobile",
  "this.Container_66588837_74AF_8B56_41CA_E204728E8E6C_mobile",
  "this.HTMLText_7DB2E382_7065_343F_41C2_951F708170F1_mobile"
 ],
 "class": "Container",
 "id": "Container_7DBCC382_7065_343F_41D5_9D3C36B5F479_mobile",
 "width": "100%",
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 10,
 "layout": "vertical",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "height": 120,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "propagateClick": true,
 "verticalAlign": "bottom",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "-Container footer"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A89BA9E7_BF1F_7580_41E7_06EE7413F9CA",
 "id": "camera_A89B59E7_BF1F_7580_41B7_3A79770E8318",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -0.02,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2866,
   "height": 2864
  },
  {
   "url": "media/popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2047,
   "height": 2046
  },
  {
   "url": "media/popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1023,
   "height": 1023
  },
  {
   "url": "media/popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 511,
   "height": 511
  }
 ],
 "id": "ImageResource_A9DA6EA1_BF1F_4F80_41DF_02E10788074F"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.41,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1023,
    "height": 1023
   }
  ]
 },
 "pitch": 1.54,
 "popupMaxWidth": "95%",
 "yaw": -13.79,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.Image_BD87AAD4_9478_3C4B_41BE_0345EF6421AD_mobile",
  "this.HTMLText_BD876AD4_9478_3C4B_41D6_3C886AE845B6_mobile",
  "this.Container_BD870AD4_9478_3C4B_41D4_7C5B5C74D90A_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD877AD4_9478_3C4B_41AC_A13D39E1584C_mobile",
 "layout": "vertical",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 10,
 "horizontalAlign": "left",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#E73B2C",
 "minHeight": 520,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 100,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 30,
 "scrollBarOpacity": 0.79,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container text"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2002,
   "height": 2417
  },
  {
   "url": "media/popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1696,
   "height": 2047
  },
  {
   "url": "media/popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 848,
   "height": 1023
  },
  {
   "url": "media/popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 424,
   "height": 511
  }
 ],
 "id": "ImageResource_A9D71E9C_BF1F_4F80_41B9_56A495961C68"
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_66589837_74AF_8B56_41D7_A6F4FAC02CC3_mobile",
 "width": 50,
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_66589837_74AF_8B56_41D7_A6F4FAC02CC3.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "height": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "data": {
  "name": "IconButton VR"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "paddingTop": 20,
 "borderRadius": 0,
 "children": [
  "this.IconButton_221B2648_0C06_E5FD_41A6_F9E27CDB95AF_mobile"
 ],
 "class": "Container",
 "id": "Container_221B3648_0C06_E5FD_4199_FCE031AE003B_mobile",
 "left": "5%",
 "right": "5%",
 "horizontalAlign": "right",
 "paddingRight": 20,
 "gap": 10,
 "layout": "vertical",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "88%",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container X global"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A839F8F8_BF1F_7380_41DB_8C796F7095C3",
 "id": "camera_A839E8F8_BF1F_7380_41D1_F4439E2719AB",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -14.56,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.08,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 793
   }
  ]
 },
 "pitch": 4.94,
 "popupMaxWidth": "95%",
 "yaw": 59.71,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Exposiciones Temporarias - Medio",
 "id": "panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4",
 "adjacentPanoramas": [
  {
   "backwardYaw": 178.89,
   "class": "AdjacentPanorama",
   "yaw": -0.6,
   "distance": 1,
   "panorama": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66"
  },
  {
   "backwardYaw": -2.77,
   "class": "AdjacentPanorama",
   "yaw": 179.91,
   "distance": 1,
   "panorama": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA"
  },
  {
   "backwardYaw": -177.34,
   "class": "AdjacentPanorama",
   "yaw": -0.67,
   "distance": 1,
   "panorama": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC"
  },
  {
   "backwardYaw": -92.72,
   "class": "AdjacentPanorama",
   "yaw": 179.98,
   "distance": 1,
   "panorama": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A098DE12_BCD7_0D04_41E3_C060F710E828",
  "this.overlay_A7347F00_BCD5_0B04_41A1_AFDEA2287FC4",
  "this.overlay_A73D7E69_BCD5_0D04_419A_0BC7434A99F0",
  "this.overlay_A73122EC_BCD5_151C_41E3_9E6C70DCE9D5",
  "this.overlay_A74C69D4_BCDB_370C_41E0_45E1F1756749",
  "this.overlay_A74C79D4_BCDB_370C_41A2_50B48E99884F",
  "this.overlay_A73E2AD1_BCDA_F504_41C4_AFF8D24C5658",
  "this.overlay_A73E3AD1_BCDA_F504_41DA_9ED971DABBEA",
  "this.overlay_A73E4AD1_BCDA_F504_41B9_88EEBF597BC4",
  "this.overlay_A73E5AD1_BCDA_F504_41C3_E88ABEA55F11",
  "this.overlay_A0949E84_BCDF_0D03_41E5_A20DC44FCD74",
  "this.overlay_A0956E84_BCDF_0D03_41E0_DF941A2010B6",
  "this.overlay_A0957E84_BCDF_0D03_41D1_593E5F1A5DBC",
  "this.overlay_A09E6037_BCDD_150C_41D0_AB5FDDDA6E6C",
  "this.overlay_A09E5037_BCDD_150C_41D8_B60BDFFE4206",
  "this.overlay_A09E4037_BCDD_150C_41BA_5A3C94191FD6",
  "this.overlay_A09E3037_BCDD_150C_41E3_B939EEEECCA6",
  "this.overlay_A09E2037_BCDD_150C_41D5_4B8E065D107B",
  "this.overlay_A09E1037_BCDD_150C_41DC_0D6FC7C8DA79",
  "this.overlay_A09CD209_BCDF_1505_41D1_B93869689260",
  "this.overlay_9F8316F7_BCDB_1D0C_41B8_0F339BA5F57E",
  "this.overlay_9953D263_BCDB_F504_41C4_046762AD87F8",
  "this.overlay_A388B164_BCDB_170C_41C2_65E1443F9799",
  "this.overlay_A30F6C5A_BCD5_0D04_41C9_E976A268694B",
  "this.popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C",
  "this.popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79",
  "this.popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346",
  "this.popup_A72CF2BD_BCD5_157C_418D_12FD770BC899",
  "this.popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2",
  "this.popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE",
  "this.popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64",
  "this.popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735",
  "this.popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE",
  "this.popup_A7257AA0_BCDA_F504_41B5_0019559949D5",
  "this.popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A",
  "this.popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A",
  "this.popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62",
  "this.popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98",
  "this.popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8",
  "this.popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C",
  "this.popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487",
  "this.popup_A0814000_BCDD_1504_41DE_578F53E9F700",
  "this.popup_A0812001_BCDD_1504_41E5_3BB22DA876C3",
  "this.popup_A08091DD_BCDF_173D_41DD_6E87ABA42077",
  "this.overlay_8C2F7E97_BC4B_0D0C_41D0_DDB422B15D13",
  "this.overlay_8DC577E8_BC4B_1B04_41C0_1A4A74994C98",
  "this.overlay_8DE9D602_BC4B_3D04_41DD_9F94665AF299"
 ],
 "hfovMax": 130
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DBC9382_7065_343F_41CC_ED357655BB95_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 101.4,
    "targetYaw": 0,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 202.73,
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 19.97,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -19.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 98.35,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 12.12
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 48.61,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 5.34
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -36.3,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -0.94
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.63,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A7F54BCC_BF1F_7580_41D0_9240E8A78EA0",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -175.85,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9017E552_BC37_7F04_41A5_19434122D6E1_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 4800,
   "height": 3200
  },
  {
   "url": "media/popup_9017E552_BC37_7F04_41A5_19434122D6E1_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 4096,
   "height": 2730
  },
  {
   "url": "media/popup_9017E552_BC37_7F04_41A5_19434122D6E1_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1365
  },
  {
   "url": "media/popup_9017E552_BC37_7F04_41A5_19434122D6E1_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 682
  },
  {
   "url": "media/popup_9017E552_BC37_7F04_41A5_19434122D6E1_0_4.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 341
  }
 ],
 "id": "ImageResource_A9A83E72_BF1F_4E80_41DB_434A60BC4955"
},
{
 "borderRadius": 0,
 "children": [
  "this.IconButton_BD84FAD4_9478_3C4B_41DD_83E1298704B1_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD84CAD4_9478_3C4B_41DB_EAABF4EA300E_mobile",
 "left": "5%",
 "right": "5%",
 "horizontalAlign": "right",
 "paddingRight": 20,
 "gap": 10,
 "layout": "vertical",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "top": "5%",
 "scrollBarColor": "#000000",
 "minWidth": 1,
 "contentOpaque": false,
 "bottom": "88%",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container X global"
 },
 "paddingTop": 20,
 "backgroundOpacity": 0
},
{
 "width": 4800,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B19B411D_BEEF_3280_41B1_BF001AC547B0.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B19B411D_BEEF_3280_41B1_BF001AC547B0",
 "height": 3200
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7677B09_BF1F_7680_41DA_2D97FF2D1BD2",
 "id": "camera_A7676B09_BF1F_7680_418D_3D5C25449A91",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0.16,
  "pitch": 0
 }
},
{
 "class": "PhotoAlbumPlayer",
 "buttonNext": "this.IconButton_2A19AC4C_0D3B_DFF0_4181_A2C230C2E510_mobile",
 "viewerArea": "this.MainViewer_mobile",
 "id": "MainViewer_mobilePhotoAlbumPlayer",
 "buttonPrevious": "this.IconButton_2A19BC4C_0D3B_DFF0_419F_D0DCB12FF482_mobile"
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.IconButton_EF7806FA_E38F_8606_41E5_5C4557EBCACB_mobile",
  "this.IconButton_EE9FBAB2_E389_8E06_41D7_903ABEDD153A_mobile",
  "this.IconButton_EED073D3_E38A_9E06_41E1_6CCC9722545D_mobile",
  "this.IconButton_EEEB3760_E38B_8603_41D6_FE6B11A3DA96_mobile",
  "this.IconButton_EEFF957A_E389_9A06_41E1_2AD21904F8C0_mobile",
  "this.IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC_mobile",
  "this.IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521_mobile"
 ],
 "class": "Container",
 "id": "Container_EF8F8BD8_E386_8E02_41E5_90850B5F0BBE_mobile",
 "visible": false,
 "width": "91.304%",
 "right": "0%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "gap": 3,
 "layout": "vertical",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "height": "85.959%",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "-button set"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_mobile",
 "rollOverIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_rollover.jpg",
 "width": "100%",
 "maxWidth": 60,
 "right": 20,
 "horizontalAlign": "right",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 50,
 "top": 20,
 "transparencyActive": false,
 "minWidth": 50,
 "mode": "push",
 "height": "36.14%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": false,
 "verticalAlign": "top",
 "pressedIconURL": "skin/IconButton_2F8A5686_0D4F_6B71_41A1_13CF877A165E_pressed.jpg",
 "data": {
  "name": "IconButton X"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 11.33,
    "targetYaw": -2.01,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 21.76,
    "targetPitch": 0.25
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -29.02,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -18.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -89.31,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.19
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -131.51,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -161.41,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.95
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 81.77,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -8.73
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A84A792B_BF1F_7280_41E4_A626253E568B",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 19.26,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3200,
   "height": 4800
  },
  {
   "url": "media/popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2730,
   "height": 4096
  },
  {
   "url": "media/popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1365,
   "height": 2048
  },
  {
   "url": "media/popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 682,
   "height": 1024
  },
  {
   "url": "media/popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099_0_4.jpg",
   "class": "ImageResourceLevel",
   "width": 341,
   "height": 512
  }
 ],
 "id": "ImageResource_A9A8BE74_BF1F_4E80_41E0_E95DF5181D28"
},
{
 "width": 3499,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B0EDA51D_BEE9_7283_41D1_795D8D9BDB7C.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B0EDA51D_BEE9_7283_41D1_795D8D9BDB7C",
 "height": 2514
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.56,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9017054F_BC37_7F1C_41CD_9E79E5C22836",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9017054F_BC37_7F1C_41CD_9E79E5C22836_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 367
   }
  ]
 },
 "pitch": 2.24,
 "popupMaxWidth": "95%",
 "yaw": 134.16,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1962,
   "height": 2284
  },
  {
   "url": "media/popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1759,
   "height": 2048
  },
  {
   "url": "media/popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 879,
   "height": 1024
  },
  {
   "url": "media/popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 439,
   "height": 512
  }
 ],
 "id": "ImageResource_A9FEFEC6_BF1F_4F80_41D0_CADCE2B562C2"
},
{
 "class": "PlayList",
 "items": [
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 0, 1)",
   "media": "this.panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 1, 2)",
   "media": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 2, 3)",
   "media": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 3, 4)",
   "media": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 4, 5)",
   "media": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 5, 6)",
   "media": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 6, 7)",
   "media": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 7, 8)",
   "media": "this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 8, 9)",
   "media": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 9, 10)",
   "media": "this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 10, 11)",
   "media": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 11, 12)",
   "media": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 12, 13)",
   "media": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 13, 14)",
   "media": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 14, 15)",
   "media": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_camera"
  },
  {
   "class": "PanoramaPlayListItem",
   "end": "this.trigger('tourEnded')",
   "begin": "this.setEndToItemIndex(this.mainPlayList, 15, 0)",
   "media": "this.panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF",
   "player": "this.MainViewer_mobilePanoramaPlayer",
   "camera": "this.panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_camera"
  }
 ],
 "id": "mainPlayList"
},
{
 "borderRadius": 0,
 "maxHeight": 50,
 "class": "IconButton",
 "id": "IconButton_7FF185EF_706F_7FC6_41A5_21B418265412_mobile",
 "left": 10,
 "width": 44,
 "maxWidth": 50,
 "rollOverIconURL": "skin/IconButton_7FF185EF_706F_7FC6_41A5_21B418265412_rollover.png",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_7FF185EF_706F_7FC6_41A5_21B418265412.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "top": "47%",
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "bottom": "48%",
 "paddingBottom": 0,
 "click": "this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "middle",
 "data": {
  "name": "IconButton arrow"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7FF195EF_706F_7FC6_41D7_A104CA87824D_mobile",
 "left": "0%",
 "width": 36,
 "backgroundColorRatios": [
  0
 ],
 "gap": 10,
 "horizontalAlign": "left",
 "layout": "absolute",
 "paddingLeft": 0,
 "paddingRight": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "borderSize": 0,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container black"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.4
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7E86BBD_BF1F_7580_41E2_B8BC5A661834",
 "id": "camera_A7E80BBD_BF1F_7580_41C1_98456D6E8AE5",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 178.15,
  "pitch": 0
 }
},
{
 "width": 3538,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AE8494BB_BEE9_3380_41D0_6262088A18B6.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AE8494BB_BEE9_3380_41D0_6262088A18B6",
 "height": 2763
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.88,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 939,
    "height": 1024
   }
  ]
 },
 "pitch": 2.01,
 "popupMaxWidth": "95%",
 "yaw": -11.79,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.52,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 867
   }
  ]
 },
 "pitch": 5.36,
 "popupMaxWidth": "95%",
 "yaw": 133.12,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A8DD1A54_BF1F_7680_41E4_5E48441A9FA4",
 "id": "camera_A8DD0A54_BF1F_7680_41BE_BCF1640C5FB2",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -2.3,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521_mobile",
 "rollOverIconURL": "skin/IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521_rollover.png",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EED5213F_E3B9_7A7D_41D8_1B642C004521.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "height": 58,
 "paddingBottom": 0,
 "click": "this.shareSocial('fb', 'https://cab.visitapy.com', false)",
 "propagateClick": true,
 "verticalAlign": "middle",
 "data": {
  "name": "IconButton FB"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile",
  "this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7F59BED9_7065_6DCD_41D6_B4AD3EEA9174_mobile",
 "left": "0%",
 "width": 425.8,
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--- LEFT PANEL 2"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "children": [
  "this.IconButton_66589837_74AF_8B56_41D7_A6F4FAC02CC3_mobile",
  "this.IconButton_6658E837_74AF_8B56_41B5_2A29A6498E57_mobile",
  "this.IconButton_6658F838_74AF_8B5A_41C1_8DA59962CFF4_mobile",
  "this.IconButton_6658C838_74AF_8B5A_418E_C797984D8CAE_mobile",
  "this.IconButton_6658D838_74AF_8B5A_41D7_154D466041BB_mobile"
 ],
 "class": "Container",
 "id": "Container_66588837_74AF_8B56_41CA_E204728E8E6C_mobile",
 "width": "100%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "gap": 16,
 "layout": "horizontal",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "minWidth": 1,
 "height": 60,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "verticalAlign": "middle",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "overflow": "scroll",
 "shadow": false,
 "data": {
  "name": "-Container settings"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A716FAA0_BF1F_7780_41BB_8643E7441A4C",
 "id": "camera_A716EAA0_BF1F_7780_41CD_54838C8E1244",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -0.09,
  "pitch": 0
 }
},
{
 "width": 3200,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AE23F183_BEE9_5580_41E7_97BE76F0D82B.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AE23F183_BEE9_5580_41E7_97BE76F0D82B",
 "height": 4800
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.05,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 923,
    "height": 1024
   }
  ]
 },
 "pitch": 9.02,
 "popupMaxWidth": "95%",
 "yaw": -46.78,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2292,
   "height": 1710
  },
  {
   "url": "media/popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1527
  },
  {
   "url": "media/popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 763
  },
  {
   "url": "media/popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 381
  }
 ],
 "id": "ImageResource_A9A4FE70_BF1F_4E80_41C5_60F94634F2E7"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 1.74,
    "targetYaw": -1.2,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 2.49,
    "yawSpeed": 2.49,
    "path": "shortest",
    "targetPitch": 2.15
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 39.32,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 38.75
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -40.82,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 38.75
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 96.59,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.21
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 65.95,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.2
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 44.09,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.2
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -46.6,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.71
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -69.46,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -102.12,
    "targetHfov": 70,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -4.46
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -178.74,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -0.94
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A863F96D_BF1F_7280_41D4_5FFB09E8C8FC",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0.13,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_3A67552A_0C3A_67BD_4195_ECE46CCB34EA_mobile",
  "this.ThumbnailList_034EDD7A_0D3B_3991_41A5_D706671923C0_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_39A197B1_0C06_62AF_419A_D15E4DDD2528_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundOpacity": 1,
 "shadowColor": "#000000",
 "right": "5%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "shadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "layout": "absolute",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "bottom": "5%",
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "verticalAlign": "top",
 "propagateClick": false,
 "shadowSpread": 1,
 "overflow": "visible",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadowOpacity": 0.3,
 "data": {
  "name": "Global"
 },
 "shadowBlurRadius": 25
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Pasillo Planta Baja - Entrada",
 "id": "panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084",
 "adjacentPanoramas": [
  {
   "backwardYaw": -160.74,
   "class": "AdjacentPanorama",
   "yaw": -89.17,
   "distance": 1,
   "panorama": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2"
  },
  {
   "backwardYaw": 174.35,
   "class": "AdjacentPanorama",
   "yaw": -93.06,
   "distance": 1,
   "panorama": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF"
  },
  {
   "backwardYaw": -179.87,
   "class": "AdjacentPanorama",
   "yaw": 0,
   "distance": 1,
   "panorama": "this.panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_AC003143_BC3A_F704_41C5_6D898A1CE15B",
  "this.overlay_ADF1F9EE_BC3D_171C_41D7_E51D9E519EE9",
  "this.overlay_B3E6F96F_BC3D_171C_41E4_AF424FAAE84A",
  "this.overlay_9BBD60C7_BC3D_350C_41C0_97AE1670FEB4",
  "this.overlay_9B1A0FA6_BC3D_0B0F_41CB_267C24857F5C",
  "this.overlay_8DC1273A_BC75_3B04_41D6_49D8BAB54FE0"
 ],
 "hfovMax": 130
},
{
 "width": 2307,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AE7D4AB8_BEE9_F780_41AE_7104144080FE.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AE7D4AB8_BEE9_F780_41AE_7104144080FE",
 "height": 2709
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3198,
   "height": 2450
  },
  {
   "url": "media/popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1568
  },
  {
   "url": "media/popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 784
  },
  {
   "url": "media/popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 392
  }
 ],
 "id": "ImageResource_A9EBAEB0_BF1F_4F80_41D6_E45B7F6B5361"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2078,
   "height": 2320
  },
  {
   "url": "media/popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1834,
   "height": 2048
  },
  {
   "url": "media/popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 917,
   "height": 1024
  },
  {
   "url": "media/popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 458,
   "height": 512
  }
 ],
 "id": "ImageResource_A9D9FEA2_BF1F_4F80_41BF_1ECEFCE3F88B"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1862,
   "height": 2393
  },
  {
   "url": "media/popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1593,
   "height": 2048
  },
  {
   "url": "media/popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 796,
   "height": 1024
  },
  {
   "url": "media/popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 398,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C3FE88_BF1F_4F80_41E5_8A186C879443"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 7.62,
    "targetYaw": 0,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 14.3,
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 19.97,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -19.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 98.35,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 12.12
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 48.61,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 5.34
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -36.3,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -0.94
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.63,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A8CBDA36_BF1F_7680_41D6_2A7DA9E2BEE4",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 11.59,
  "pitch": 0
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 19.97,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -19.78
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 98.35,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 12.12
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 48.61,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 5.34
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -36.3,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -0.94
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.63,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2331,
   "height": 2519
  },
  {
   "url": "media/popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1895,
   "height": 2048
  },
  {
   "url": "media/popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 947,
   "height": 1024
  },
  {
   "url": "media/popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 473,
   "height": 512
  }
 ],
 "id": "ImageResource_A9DE0EA4_BF1F_4F80_41E2_C6ECA19DBA30"
},
{
 "paddingTop": 20,
 "borderRadius": 0,
 "children": [
  "this.IconButton_BD140CC8_9478_145B_41BD_F96EEC163BAF_mobile"
 ],
 "class": "Container",
 "id": "Container_BD147CC8_9478_145B_41E1_A1505134A3C3_mobile",
 "left": "5%",
 "right": "5%",
 "horizontalAlign": "right",
 "paddingRight": 20,
 "gap": 10,
 "layout": "vertical",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "85%",
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "Container X global"
 },
 "scrollBarWidth": 10,
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7BF8B82_BF1F_7580_41C3_443310983A67",
 "id": "camera_A7BFAB81_BF1F_7580_41E3_2A73EB9DDA30",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -1.11,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.53,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 947,
    "height": 1024
   }
  ]
 },
 "pitch": 4.11,
 "popupMaxWidth": "95%",
 "yaw": -142.09,
 "showDuration": 500
},
{
 "width": 2062,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B3486116_BEEA_F280_41E6_3D297359CA21.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B3486116_BEEA_F280_41E6_3D297359CA21",
 "height": 3109
},
{
 "width": 3324,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_B310E90A_BEEE_D280_41DD_AF2A5BD7EFF6.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_B310E90A_BEEE_D280_41DD_AF2A5BD7EFF6",
 "height": 2528
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7D02B9F_BF1F_7580_4196_9036874A5E04",
 "id": "camera_A7D1DB9F_BF1F_7580_41D4_E81A9C6567C1",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 2.66,
  "pitch": 0
 }
},
{
 "paddingTop": 0,
 "borderRadius": 0,
 "class": "HTMLText",
 "id": "HTMLText_BD15BCC8_9478_145B_41A0_1BDCC9E92EE8_mobile",
 "width": "100%",
 "paddingRight": 10,
 "paddingLeft": 10,
 "borderSize": 0,
 "scrollBarColor": "#04A3E1",
 "minHeight": 1,
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "paddingBottom": 20,
 "scrollBarOpacity": 0.5,
 "height": "67.221%",
 "propagateClick": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "HTMLText"
 },
 "shadow": false,
 "scrollBarWidth": 10,
 "html": "<div style=\"text-align:left; color:#000; \"><p STYLE=\"margin:0; line-height:2.22vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.67vw;font-family:'Oswald';\"><B><I>Centro Cultural</I></B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:4.72vw;font-family:'Oswald';\"><B><I>de la Rep\u00fablica</I></B></SPAN></SPAN></DIV><DIV STYLE=\"text-align:center;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:6.67vw;font-family:'Oswald';\"><B><I>El Cabildo</I></B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:2.22vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:left;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"color:#0000ff;font-size:3.89vw;font-family:'Oswald';\"><B>Un lugar donde se exhiben obras y objetos de la cultura e historia del Paraguay.</B></SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.39vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><p STYLE=\"margin:0; line-height:0.61vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.06vw;\">Fue inaugurado el 14 de mayo de 2004 por iniciativa de Carlo Mateo Balmelli, entonces presidente del Congreso Nacional, fundador y miembro de honor, con el apoyo de todos los miembros del Cuerpo Legislativo.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.39vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.06vw;\">Se le denomin\u00f3 de esta forma porque tiene como finalidad ser un lugar abierto a todas las personas sin discriminaciones de clase y por estar erigido en el antiguo lugar donde estuvo el Cabildo, Justicia y Regimiento, instituci\u00f3n colonial espa\u00f1ola que en Am\u00e9rica fue la que otorg\u00f3 el estatus de ciudad al primer enclave ciudadano en la regi\u00f3n rioplatense.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:1.39vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.06vw;\">Este edificio tambi\u00e9n fue la cuna del Paraguay, cuando el 16 de septiembre de 1541 el gobernador Domingo Mart\u00ednez de Irala dio el enclave militar que fue el fuerte Nuestra Se\u00f1ora de la Asunci\u00f3n, el cual fue fundado por el capit\u00e1n Juan de Salazar y Espinosa el 15 de agosto de 1537.</SPAN></SPAN></DIV><p STYLE=\"margin:0; line-height:3.06vw;\"><BR STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-size:0.38vw;font-family:Arial, Helvetica, sans-serif;\"/></p><DIV STYLE=\"text-align:justify;\"><SPAN STYLE=\"letter-spacing:0vw; white-space:pre-wrap;color:#000000;font-family:Arial, Helvetica, sans-serif;\"><SPAN STYLE=\"font-size:3.06vw;\">Ese lugar estuvo ocupado tambi\u00e9n por el Congreso Nacional. Hab\u00eda sido construido originalmente hacia 1844, para sede de los poderes Ejecutivo y Legislativo. Fue en su momento una de las obras m\u00e1s importantes que emprendi\u00f3 el gobierno de Carlos Antonio L\u00f3pez (1844-1862). Fue sede del Poder Ejecutivo hasta el 15 de noviembre de 1894, en que pas\u00f3 a funcionar en el palacio construido por Francisco Solano L\u00f3pez. Desde entonces se convirti\u00f3 en sede del Congreso Nacional hasta 2003.</SPAN></SPAN></DIV></div>",
 "backgroundOpacity": 0
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2427,
   "height": 2899
  },
  {
   "url": "media/popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1714,
   "height": 2048
  },
  {
   "url": "media/popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 857,
   "height": 1024
  },
  {
   "url": "media/popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 428,
   "height": 512
  }
 ],
 "id": "ImageResource_A9BFDE84_BF1F_4F80_41DD_DA8651654F4D"
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Pasillo Planta Baja",
 "id": "panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF",
 "adjacentPanoramas": [
  {
   "backwardYaw": -160.08,
   "class": "AdjacentPanorama",
   "yaw": 5.8,
   "distance": 1,
   "panorama": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2"
  },
  {
   "backwardYaw": -93.06,
   "class": "AdjacentPanorama",
   "yaw": 174.35,
   "distance": 1,
   "panorama": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084"
  },
  {
   "backwardYaw": -89.01,
   "class": "AdjacentPanorama",
   "yaw": -0.2,
   "distance": 1,
   "panorama": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_B362622E_BC3B_351C_41DF_93D86A6950FE",
  "this.overlay_AD147811_BC3B_F504_41E1_31A7F28CE3C8",
  "this.overlay_AE2A68CA_BC3D_3504_41C6_988DCF0D6336"
 ],
 "hfovMax": 130
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 108,
    "targetYaw": 0,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 216,
    "targetPitch": 0
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -23.49,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -9.23
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -72.23,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.79
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -120.21,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -21.04
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -163.92,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 110.66,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 7.85
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 9.67,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -1.44
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "camera_A779CB29_BF1F_7680_41B3_3BF5CEF707DC",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -174.2,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.71,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 784
   }
  ]
 },
 "pitch": 5.15,
 "popupMaxWidth": "95%",
 "yaw": 45.14,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9017054F_BC37_7F1C_41CD_9E79E5C22836_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3920,
   "height": 1408
  },
  {
   "url": "media/popup_9017054F_BC37_7F1C_41CD_9E79E5C22836_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 735
  },
  {
   "url": "media/popup_9017054F_BC37_7F1C_41CD_9E79E5C22836_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 367
  },
  {
   "url": "media/popup_9017054F_BC37_7F1C_41CD_9E79E5C22836_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 183
  }
 ],
 "id": "ImageResource_A9ABFE71_BF1F_4E80_41D6_347C3D22E1DD"
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_BD158CC8_9478_145B_41B5_3F260A00D36A_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD15DCC8_9478_145B_41E1_35766BBBD98F_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundOpacity": 1,
 "shadowColor": "#000000",
 "right": "5%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "shadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "layout": "horizontal",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "bottom": "5%",
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "verticalAlign": "top",
 "propagateClick": false,
 "shadowSpread": 1,
 "overflow": "scroll",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadowOpacity": 0.3,
 "data": {
  "name": "Global"
 },
 "shadowBlurRadius": 25
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.5,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 367
   }
  ]
 },
 "pitch": 4.81,
 "popupMaxWidth": "95%",
 "yaw": 111.39,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_BD159CC8_9478_145B_41AA_EFEDE92BF07B_mobile",
  "this.Container_BD15ACC8_9478_145B_41C2_6D37AD97A48D_mobile",
  "this.Container_BD146CC8_9478_145B_41D1_ED9BAFE44A6B_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD158CC8_9478_145B_41B5_3F260A00D36A_mobile",
 "layout": "vertical",
 "width": "100%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "gap": 0,
 "horizontalAlign": "left",
 "paddingLeft": 50,
 "paddingRight": 50,
 "scrollBarColor": "#0069A3",
 "minHeight": 1,
 "borderSize": 0,
 "contentOpaque": false,
 "minWidth": 460,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "paddingBottom": 20,
 "scrollBarOpacity": 0.51,
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "verticalAlign": "top",
 "overflow": "visible",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "-right"
 },
 "paddingTop": 20,
 "backgroundOpacity": 1
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_2A19EC4C_0D3B_DFF0_414D_37145C22C5BC_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536_mobile",
 "left": "5%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "backgroundOpacity": 1,
 "shadowColor": "#000000",
 "right": "5%",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "shadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "layout": "vertical",
 "minHeight": 1,
 "top": "5%",
 "contentOpaque": false,
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "minWidth": 1,
 "paddingBottom": 0,
 "bottom": "5%",
 "scrollBarOpacity": 0.5,
 "shadowVerticalLength": 0,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "verticalAlign": "top",
 "propagateClick": false,
 "shadowSpread": 1,
 "overflow": "visible",
 "shadow": true,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "shadowOpacity": 0.3,
 "data": {
  "name": "Global"
 },
 "shadowBlurRadius": 25
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCEB299B_BC3F_3705_41E0_8AC73FF3978D.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCEB299B_BC3F_3705_41E0_8AC73FF3978D.ogg"
 },
 "id": "audio_FCEB299B_BC3F_3705_41E0_8AC73FF3978D",
 "data": {
  "label": "Che la reina - Emiliano R. Fern\u00e1ndez"
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.05,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 883
   }
  ]
 },
 "pitch": 4.14,
 "popupMaxWidth": "95%",
 "yaw": -134.37,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1781E_B8EE_8E14_41D1_528375673140",
 "id": "panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2150,
   "height": 2519
  },
  {
   "url": "media/popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1747,
   "height": 2048
  },
  {
   "url": "media/popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 873,
   "height": 1024
  },
  {
   "url": "media/popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 436,
   "height": 512
  }
 ],
 "id": "ImageResource_A9FA9EC1_BF1F_4F80_41E6_F9E985FFC9F3"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2279,
   "height": 2752
  },
  {
   "url": "media/popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1696,
   "height": 2048
  },
  {
   "url": "media/popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 848,
   "height": 1024
  },
  {
   "url": "media/popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 424,
   "height": 512
  }
 ],
 "id": "ImageResource_A9B8DE83_BF1F_4F80_41DF_D33FB92DC3E1"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1721,
   "height": 2018
  },
  {
   "url": "media/popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 873,
   "height": 1024
  },
  {
   "url": "media/popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 436,
   "height": 512
  }
 ],
 "id": "ImageResource_A9B56E7E_BF1F_4E80_41B3_F37731E41E3A"
},
{
 "borderRadius": 0,
 "maxHeight": 1000,
 "class": "Image",
 "id": "Image_BD15FCC8_9478_145B_41DA_B306F52E3FCF_mobile",
 "width": "100%",
 "maxWidth": 2000,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "url": "skin/Image_BD15FCC8_9478_145B_41DA_B306F52E3FCF.jpg",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "minWidth": 1,
 "height": "31.8%",
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "scaleMode": "fit_outside",
 "data": {
  "name": "Image"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.65,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5B14704_BC3B_1B03_417B_D212E161463C",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5B14704_BC3B_1B03_417B_D212E161463C_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 778,
    "height": 1024
   }
  ]
 },
 "pitch": 12.86,
 "popupMaxWidth": "95%",
 "yaw": -144.96,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.88,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 847,
    "height": 1024
   }
  ]
 },
 "pitch": 6.7,
 "popupMaxWidth": "95%",
 "yaw": -35.78,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 0.13,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 29.46
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 101.62,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -4.96
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 123.73,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -11.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -122.97,
    "path": "shortest",
    "easing": "cubic_in_out",
    "yawSpeed": 33.25,
    "targetPitch": -10.49
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -105.89,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -91.57,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.21
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A63929AC_BCCD_171C_41D7_6988B9694168_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1826,
   "height": 2136
  },
  {
   "url": "media/popup_A63929AC_BCCD_171C_41D7_6988B9694168_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1750,
   "height": 2048
  },
  {
   "url": "media/popup_A63929AC_BCCD_171C_41D7_6988B9694168_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 875,
   "height": 1024
  },
  {
   "url": "media/popup_A63929AC_BCCD_171C_41D7_6988B9694168_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 437,
   "height": 512
  }
 ],
 "id": "ImageResource_A9D42E9F_BF1F_4F80_41CF_367C112832D4"
},
{
 "borderRadius": 0,
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7DB30382_7065_343F_416C_8610BCBA9F50_mobile",
 "layout": "absolute",
 "backgroundColorRatios": [
  0,
  1
 ],
 "width": "100%",
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "contentOpaque": false,
 "height": 1,
 "minWidth": 1,
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColor": [
  "#FFFFFF",
  "#FFFFFF"
 ],
 "backgroundColorDirection": "vertical",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "line"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.3
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E1181E_B8EE_8E14_41E2_95D4129EF4F5",
 "id": "panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A60CDBEB_BF1F_7580_41CB_4BABB70EBB1F",
 "id": "camera_A60CFBEA_BF1F_7580_41CE_96038FF946C1",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 179.05,
  "pitch": 0
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.66,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 913,
    "height": 1024
   }
  ]
 },
 "pitch": 6.63,
 "popupMaxWidth": "95%",
 "yaw": 155.3,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.01,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 818
   }
  ]
 },
 "pitch": 11.14,
 "popupMaxWidth": "95%",
 "yaw": 153.55,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "maxHeight": 58,
 "class": "IconButton",
 "id": "IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC_mobile",
 "rollOverIconURL": "skin/IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC_rollover.png",
 "width": 58,
 "maxWidth": 58,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_EE5807F6_E3BE_860E_41E7_431DDDA54BAC.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "push",
 "height": 58,
 "paddingBottom": 0,
 "click": "this.shareSocial('tw', 'https://cab.visitapy.com', false)",
 "propagateClick": true,
 "verticalAlign": "middle",
 "data": {
  "name": "IconButton TWITTER"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A88929C7_BF1F_7580_41DA_A373CB25D7AE",
 "id": "camera_A88AD9C7_BF1F_7580_41BF_BA9AD8A7D09C",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 94.94,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2333,
   "height": 2014
  },
  {
   "url": "media/popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1767
  },
  {
   "url": "media/popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 883
  },
  {
   "url": "media/popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 441
  }
 ],
 "id": "ImageResource_A9D8FEA3_BF1F_4F80_41B4_CEE2F82BEDAD"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3386,
   "height": 2278
  },
  {
   "url": "media/popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1377
  },
  {
   "url": "media/popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 688
  },
  {
   "url": "media/popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 344
  }
 ],
 "id": "ImageResource_A9A63E6E_BF1F_4E80_41D2_37F22CFA9900"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A772B107_BC35_170D_41E5_20064B709D84_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2331,
   "height": 2519
  },
  {
   "url": "media/popup_A772B107_BC35_170D_41E5_20064B709D84_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1895,
   "height": 2048
  },
  {
   "url": "media/popup_A772B107_BC35_170D_41E5_20064B709D84_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 947,
   "height": 1024
  },
  {
   "url": "media/popup_A772B107_BC35_170D_41E5_20064B709D84_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 473,
   "height": 512
  }
 ],
 "id": "ImageResource_A9CB8E90_BF1F_4F80_41E6_53E85D08DBE0"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2296,
   "height": 2502
  },
  {
   "url": "media/popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1879,
   "height": 2048
  },
  {
   "url": "media/popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 939,
   "height": 1024
  },
  {
   "url": "media/popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 469,
   "height": 512
  }
 ],
 "id": "ImageResource_A9F15EBA_BF1F_4F80_41DB_171F63F2AE4B"
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Exposiciones Temporarias - Entrada",
 "id": "panorama_B582C310_B8D1_83EC_41DD_839A838F01EC",
 "adjacentPanoramas": [
  {
   "backwardYaw": -2.84,
   "class": "AdjacentPanorama",
   "yaw": -177.61,
   "distance": 1,
   "panorama": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA"
  },
  {
   "backwardYaw": -0.67,
   "class": "AdjacentPanorama",
   "yaw": -177.34,
   "distance": 1,
   "panorama": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4"
  },
  {
   "backwardYaw": -92.8,
   "class": "AdjacentPanorama",
   "yaw": -177.6,
   "distance": 1,
   "panorama": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3"
  },
  {
   "backwardYaw": 179.27,
   "class": "AdjacentPanorama",
   "yaw": 2.4,
   "distance": 1,
   "panorama": "this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A2BED77D_BCD7_3BFC_41DD_D7E98F494A3B",
  "this.overlay_A2BEA77D_BCD7_3BFC_41E2_961A996D4473",
  "this.overlay_A2BEB77D_BCD7_3BFC_41E6_A70A522E7EE9",
  "this.overlay_A2BE877D_BCD7_3BFC_41DD_36DFF04160CD",
  "this.overlay_A2BF677D_BCD7_3BFC_41B0_9CEA7AFE40FD",
  "this.overlay_A2BF777D_BCD7_3BFC_41A0_51DFE0C25D4C",
  "this.overlay_A2BE977D_BCD7_3BFC_41C4_32CC60EDA226",
  "this.overlay_A2966AF7_BCCB_750C_419A_BC9BB24AA4F1",
  "this.overlay_A2967AF7_BCCB_750C_41DC_4C96F5C42FAD",
  "this.overlay_A2965AF7_BCCB_750C_41BB_04D317EBB16A",
  "this.overlay_A2966AF7_BCCB_750C_4169_D31EB984774C",
  "this.overlay_A2967AF7_BCCB_750C_41E4_63427B254028",
  "this.overlay_A2960AF8_BCCB_7504_41D1_BB3D4F561451",
  "this.overlay_A2961AF8_BCCB_7504_41D1_8D426BC373B8",
  "this.overlay_9E19809E_BCCD_F53F_41E3_47249BED0F25",
  "this.overlay_99550AE4_BCCD_750C_41D9_BBC3DB345A56",
  "this.overlay_97E0FD35_BCCF_0F0C_41D2_AFB7B8D5CA87",
  "this.overlay_A3F40EA6_BCCD_0D0C_41E2_9509E9637277",
  "this.overlay_A3F43EA6_BCCD_0D0C_41D7_A016B7FF3477",
  "this.overlay_A3F42EA6_BCCD_0D0C_41BC_2D3468E7FF90",
  "this.overlay_A3F4DEA6_BCCD_0D0C_41E2_F74818B94961",
  "this.overlay_A3F4CEA6_BCCD_0D0C_41E2_E7C7CAB701FC",
  "this.overlay_A3F4FEA6_BCCD_0D0C_41D2_A6657F36DB6F",
  "this.overlay_9981998F_BCCA_F71C_41DF_89CC8DE0BF57",
  "this.popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541",
  "this.popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6",
  "this.popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B",
  "this.popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85",
  "this.popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C",
  "this.popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F",
  "this.popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9",
  "this.popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7",
  "this.popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC",
  "this.popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535",
  "this.popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A",
  "this.popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004",
  "this.popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338",
  "this.popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650",
  "this.popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99",
  "this.popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6",
  "this.popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF",
  "this.popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E",
  "this.popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09",
  "this.popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4",
  "this.overlay_8DD4AB06_BC4B_0B0C_41DA_18073B5EB6E8",
  "this.overlay_8DC8F322_BC4B_1B04_41CE_5FB99DE844E8",
  "this.overlay_8DFFD92A_BC4B_1704_41D0_EAA8052408E8"
 ],
 "hfovMax": 130
},
{
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0.8,
 "fontSize": "26px",
 "shadowBlurRadius": 6,
 "class": "Button",
 "id": "Button_7DB31382_7065_343F_41D6_641BBE1B2562_mobile",
 "pressedBackgroundOpacity": 1,
 "width": "99.545%",
 "shadowColor": "#000000",
 "fontFamily": "Oswald",
 "label": "Informaci\u00f3n del Cabildo",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "paddingLeft": 10,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "click": "this.setComponentVisibility(this.Container_BD141CC8_9478_145B_41D4_265F47E47DB6_mobile, true, 0, null, null, false); this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false)",
 "borderColor": "#000000",
 "gap": 5,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "height": 60,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "italic",
 "verticalAlign": "middle",
 "propagateClick": true,
 "iconHeight": 32,
 "data": {
  "name": "Button Tour Info"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 32,
 "textDecoration": "none",
 "paddingTop": 0,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.29,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 857,
    "height": 1024
   }
  ]
 },
 "pitch": 12.35,
 "popupMaxWidth": "95%",
 "yaw": 10.49,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.07,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 883
   }
  ]
 },
 "pitch": 5.94,
 "popupMaxWidth": "95%",
 "yaw": -85.65,
 "showDuration": 500
},
{
 "borderRadius": 0,
 "children": [
  "this.Container_7FF195EF_706F_7FC6_41D7_A104CA87824D_mobile",
  "this.IconButton_7FF185EF_706F_7FC6_41A5_21B418265412_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile",
 "left": "0%",
 "width": 66,
 "gap": 10,
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "scrollBarVisible": "rollOver",
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "height": "100%",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "- COLLAPSE"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_831926D5_BC3F_3D0C_41E6_9B744B3F42B1.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_831926D5_BC3F_3D0C_41E6_9B744B3F42B1.ogg"
 },
 "id": "audio_831926D5_BC3F_3D0C_41E6_9B744B3F42B1",
 "data": {
  "label": "13 Tuyut\u00ed subtitulado en guaran\u00ed y espa\u00f1ol"
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.79,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 1000
   }
  ]
 },
 "pitch": 2.55,
 "popupMaxWidth": "95%",
 "yaw": -22.85,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Pasillo Planta Baja",
 "id": "panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2",
 "adjacentPanoramas": [
  {
   "backwardYaw": -90.77,
   "class": "AdjacentPanorama",
   "yaw": 14.99,
   "distance": 1,
   "panorama": "this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD"
  },
  {
   "backwardYaw": 5.8,
   "class": "AdjacentPanorama",
   "yaw": -160.08,
   "distance": 1,
   "panorama": "this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF"
  },
  {
   "backwardYaw": -89.17,
   "class": "AdjacentPanorama",
   "yaw": -160.74,
   "distance": 1,
   "panorama": "this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084"
  },
  {
   "backwardYaw": -115.89,
   "class": "AdjacentPanorama",
   "yaw": 83.72,
   "distance": 1,
   "panorama": "this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_A9E88B08_BC3D_0B04_41D2_CD5B8D303355",
  "this.overlay_AFC1C37B_BC3B_1B04_41AD_132794EB064B",
  "this.overlay_A8B60D08_BC3B_0F04_41AF_FAA67409D144",
  "this.overlay_A8DDDE48_BC3B_0D04_41DC_F34535948562",
  "this.overlay_8D184A0C_BC77_F503_41E7_1EEB9E4DC750",
  "this.popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE"
 ],
 "hfovMax": 130
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 39.32,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 38.75
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -40.82,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 38.75
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 96.59,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.21
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 65.95,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.2
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 44.09,
    "targetHfov": 75,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.2
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -46.6,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -3.71
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -69.46,
    "targetHfov": 80,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -5.97
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -102.12,
    "targetHfov": 70,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -4.46
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -178.74,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -0.94
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": -1.2,
  "pitch": 2.15
 }
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCEEDA27_BC3F_350D_41C2_303E4F67905F.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCEEDA27_BC3F_350D_41C2_303E4F67905F.ogg"
 },
 "id": "audio_FCEEDA27_BC3F_350D_41C2_303E4F67905F",
 "data": {
  "label": "GUERRA DEL CHACO che retempe pyhare Musical"
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2333,
   "height": 2014
  },
  {
   "url": "media/popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1767
  },
  {
   "url": "media/popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 883
  },
  {
   "url": "media/popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 441
  }
 ],
 "id": "ImageResource_A9CA8E91_BF1F_4F80_41E2_381E286B43E1"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 4.4,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_90173551_BC37_7F04_41C9_80B87737433F",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_90173551_BC37_7F04_41C9_80B87737433F_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 688
   }
  ]
 },
 "pitch": 12.92,
 "popupMaxWidth": "95%",
 "yaw": 92.01,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": {
  "class": "PanoramaCameraSequence",
  "movements": [
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": 154.12,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 33.22
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -155.63,
    "targetHfov": 110,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": 35.99
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -115.18,
    "targetHfov": 100,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -6.47
   },
   {
    "class": "TargetPanoramaCameraMovement",
    "pitchSpeed": 17.05,
    "targetYaw": -0.88,
    "targetHfov": 90,
    "easing": "cubic_in_out",
    "hfovSpeed": 33.25,
    "yawSpeed": 33.25,
    "path": "shortest",
    "targetPitch": -2.45
   }
  ],
  "restartMovementOnUserInteraction": false
 },
 "id": "panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 72.6,
  "pitch": -4.02
 }
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCE29AB3_BC3F_3504_41E2_5B379CEB0160.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCE29AB3_BC3F_3504_41E2_5B379CEB0160.ogg"
 },
 "id": "audio_FCE29AB3_BC3F_3504_41E2_5B379CEB0160",
 "data": {
  "label": "Lidia Mar\u00edana - Quemil Yambay"
 }
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 1.79,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099_0_3.jpg",
    "class": "ImageResourceLevel",
    "width": 682,
    "height": 1024
   }
  ]
 },
 "pitch": -22.55,
 "popupMaxWidth": "95%",
 "yaw": 43.99,
 "showDuration": 500
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5FD681D_B8EE_8E14_41DC_A7ADD9842E22",
 "id": "panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "maxHeight": 60,
 "class": "IconButton",
 "id": "IconButton_6658F838_74AF_8B5A_41C1_8DA59962CFF4_mobile",
 "width": 50,
 "maxWidth": 60,
 "horizontalAlign": "center",
 "paddingRight": 0,
 "iconURL": "skin/IconButton_6658F838_74AF_8B5A_41C1_8DA59962CFF4.png",
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "transparencyActive": true,
 "minWidth": 1,
 "mode": "toggle",
 "height": 50,
 "paddingBottom": 0,
 "propagateClick": false,
 "verticalAlign": "middle",
 "pressedIconURL": "skin/IconButton_6658F838_74AF_8B5A_41C1_8DA59962CFF4_pressed.png",
 "data": {
  "name": "IconButton Hs visibility"
 },
 "shadow": false,
 "paddingTop": 0,
 "cursor": "hand",
 "backgroundOpacity": 0
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCDEDC63_BC3F_0D04_41C3_B3B5758CC5EB.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCDEDC63_BC3F_0D04_41C3_B3B5758CC5EB.ogg"
 },
 "id": "audio_FCDEDC63_BC3F_0D04_41C3_B3B5758CC5EB",
 "data": {
  "label": "Nde Rend\u00e1pe aju - Manuel Ortiz Guerrero"
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3255,
   "height": 2601
  },
  {
   "url": "media/popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1636
  },
  {
   "url": "media/popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 818
  },
  {
   "url": "media/popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 409
  }
 ],
 "id": "ImageResource_A9CE4E95_BF1F_4F80_41BB_C99F33DB0A68"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.28,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1023,
    "height": 773
   }
  ]
 },
 "pitch": 5.73,
 "popupMaxWidth": "95%",
 "yaw": -128,
 "showDuration": 500
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_2A193C4C_0D3B_DFF0_4161_A2CD128EF536_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#000000",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_2A1A5C4D_0D3B_DFF0_41A9_8FC811D03C8E_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--PHOTOALBUM"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.6
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCF7290A_BC3F_3707_41C7_561A6F85CB92.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCF7290A_BC3F_3707_41C7_561A6F85CB92.ogg"
 },
 "id": "audio_FCF7290A_BC3F_3707_41C7_561A6F85CB92",
 "data": {
  "label": "Che jazm\u00edn - Luis Alberto del Paran\u00e1"
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2718,
   "height": 3048
  },
  {
   "url": "media/popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1826,
   "height": 2048
  },
  {
   "url": "media/popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 913,
   "height": 1024
  },
  {
   "url": "media/popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 456,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C38E89_BF1F_4F80_41E5_DDC343A66275"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.23,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 817,
    "height": 1024
   }
  ]
 },
 "pitch": 7.02,
 "popupMaxWidth": "95%",
 "yaw": -44.7,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Patio Planta Baja",
 "id": "panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23",
 "adjacentPanoramas": [
  {
   "backwardYaw": 83.72,
   "class": "AdjacentPanorama",
   "yaw": -115.89,
   "distance": 1,
   "panorama": "this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2"
  },
  {
   "backwardYaw": 169.38,
   "class": "AdjacentPanorama",
   "yaw": -9.43,
   "distance": 1,
   "panorama": "this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873"
  },
  {
   "backwardYaw": -168.41,
   "class": "AdjacentPanorama",
   "yaw": -0.44,
   "distance": 1,
   "panorama": "this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_AF992BA1_BC37_0B04_41C1_9E5838506A66",
  "this.overlay_AFE5F6BA_BC37_7D04_41E0_B69BF31957A1",
  "this.overlay_A97516D9_BC4F_1D04_41E4_FACD4C37D39A",
  "this.overlay_8D000C61_BC75_0D05_41D4_DEAB7D8DA7AD",
  "this.popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C"
 ],
 "hfovMax": 130
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.21,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 848,
    "height": 1023
   }
  ]
 },
 "pitch": 5.64,
 "popupMaxWidth": "95%",
 "yaw": -32.54,
 "showDuration": 500
},
{
 "toolTipShadowSpread": 0,
 "class": "ViewerArea",
 "id": "ViewerAreaLabeled_2A198C4C_0D3B_DFF0_419F_C9A785406D9C_mobile",
 "left": "0%",
 "width": "100%",
 "progressBackgroundColorDirection": "vertical",
 "playbackBarBottom": 0,
 "progressBarBorderRadius": 0,
 "playbackBarProgressBorderRadius": 0,
 "toolTipShadowVerticalLength": 0,
 "toolTipShadowHorizontalLength": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 1,
 "toolTipBorderRadius": 3,
 "displayTooltipInTouchScreens": true,
 "toolTipPaddingLeft": 6,
 "vrPointerSelectionTime": 2000,
 "progressBorderColor": "#FFFFFF",
 "toolTipDisplayTime": 600,
 "firstTransitionDuration": 0,
 "minWidth": 1,
 "playbackBarHeadWidth": 6,
 "playbackBarHeadShadowHorizontalLength": 0,
 "toolTipFontStyle": "normal",
 "height": "100%",
 "progressBorderSize": 0,
 "playbackBarProgressBorderColor": "#000000",
 "playbackBarHeadShadowColor": "#000000",
 "propagateClick": false,
 "toolTipShadowBlurRadius": 3,
 "progressBarBorderColor": "#0066FF",
 "toolTipFontWeight": "normal",
 "toolTipFontFamily": "Arial",
 "playbackBarProgressBorderSize": 0,
 "progressBottom": 2,
 "toolTipPaddingBottom": 4,
 "playbackBarBackgroundColorDirection": "vertical",
 "toolTipPaddingTop": 4,
 "shadow": false,
 "transitionDuration": 500,
 "playbackBarHeadOpacity": 1,
 "toolTipFontSize": 12,
 "progressHeight": 10,
 "playbackBarHeadHeight": 15,
 "progressRight": 0,
 "playbackBarHeadBackgroundColorDirection": "vertical",
 "toolTipBackgroundColor": "#F6F6F6",
 "playbackBarLeft": 0,
 "progressLeft": 0,
 "playbackBarProgressBackgroundColor": [
  "#3399FF"
 ],
 "playbackBarBorderRadius": 0,
 "playbackBarRight": 0,
 "borderRadius": 0,
 "toolTipBorderSize": 1,
 "playbackBarHeadBorderRadius": 0,
 "playbackBarHeadShadowVerticalLength": 0,
 "toolTipTextShadowColor": "#000000",
 "progressBackgroundOpacity": 1,
 "progressOpacity": 1,
 "progressBackgroundColor": [
  "#FFFFFF"
 ],
 "playbackBarHeadBorderColor": "#000000",
 "paddingRight": 0,
 "playbackBarOpacity": 1,
 "playbackBarProgressOpacity": 1,
 "playbackBarHeadBorderSize": 0,
 "toolTipTextShadowOpacity": 0,
 "playbackBarHeadShadowOpacity": 0.7,
 "toolTipOpacity": 1,
 "playbackBarBorderSize": 0,
 "top": "0%",
 "playbackBarProgressBackgroundColorDirection": "vertical",
 "playbackBarHeadShadowBlurRadius": 3,
 "toolTipFontColor": "#606060",
 "progressBackgroundColorRatios": [
  0.01
 ],
 "progressBarBackgroundColor": [
  "#3399FF"
 ],
 "toolTipPaddingRight": 6,
 "playbackBarHeadBackgroundColorRatios": [
  0,
  1
 ],
 "progressBarOpacity": 1,
 "progressBorderRadius": 0,
 "paddingBottom": 0,
 "vrPointerColor": "#FFFFFF",
 "playbackBarProgressBackgroundColorRatios": [
  0
 ],
 "progressBarBorderSize": 0,
 "playbackBarHeadBackgroundColor": [
  "#111111",
  "#666666"
 ],
 "toolTipShadowColor": "#333333",
 "toolTipBorderColor": "#767676",
 "progressBarBackgroundColorDirection": "vertical",
 "vrPointerSelectionColor": "#FF6600",
 "toolTipTextShadowBlurRadius": 3,
 "playbackBarBackgroundColor": [
  "#FFFFFF"
 ],
 "progressBarBackgroundColorRatios": [
  0
 ],
 "playbackBarBackgroundOpacity": 1,
 "playbackBarBorderColor": "#FFFFFF",
 "data": {
  "name": "Viewer photoalbum 1"
 },
 "toolTipShadowOpacity": 1,
 "playbackBarHeadShadow": true,
 "paddingTop": 0,
 "playbackBarHeight": 10,
 "transitionMode": "blending"
},
{
 "visible": false,
 "borderRadius": 0,
 "children": [
  "this.Container_BD878AD4_9478_3C4B_41E0_1542ED46C5EC_mobile",
  "this.Container_BD84CAD4_9478_3C4B_41DB_EAABF4EA300E_mobile"
 ],
 "class": "Container",
 "scrollBarWidth": 10,
 "id": "Container_BD84EAD4_9478_3C4B_41C0_BDBA5096F748_mobile",
 "left": "0%",
 "backgroundColorRatios": [
  0,
  1
 ],
 "right": "0%",
 "horizontalAlign": "left",
 "paddingRight": 0,
 "layout": "absolute",
 "paddingLeft": 0,
 "borderSize": 0,
 "scrollBarColor": "#04A3E1",
 "gap": 10,
 "creationPolicy": "inAdvance",
 "minHeight": 1,
 "top": "0%",
 "contentOpaque": false,
 "minWidth": 1,
 "bottom": "0%",
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "paddingBottom": 0,
 "scrollBarOpacity": 0.5,
 "scrollBarVisible": "rollOver",
 "backgroundColorDirection": "vertical",
 "click": "this.setComponentVisibility(this.Container_BD84EAD4_9478_3C4B_41C0_BDBA5096F748_mobile, false, 0, null, null, false); this.setComponentVisibility(this.Container_7FF1F5EF_706F_7FC6_41C7_BCBB555D2D3D_mobile, true, 0, null, null, false)",
 "propagateClick": true,
 "verticalAlign": "top",
 "overflow": "scroll",
 "shadow": false,
 "scrollBarMargin": 2,
 "data": {
  "name": "--REALTOR"
 },
 "paddingTop": 0,
 "backgroundOpacity": 0.6
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A62FF904_BCCB_170C_41E6_F995F1691FDC_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2342,
   "height": 2739
  },
  {
   "url": "media/popup_A62FF904_BCCB_170C_41E6_F995F1691FDC_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1751,
   "height": 2048
  },
  {
   "url": "media/popup_A62FF904_BCCB_170C_41E6_F995F1691FDC_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 875,
   "height": 1024
  },
  {
   "url": "media/popup_A62FF904_BCCB_170C_41E6_F995F1691FDC_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 437,
   "height": 512
  }
 ],
 "id": "ImageResource_A9C82E94_BF1F_4F80_41E3_56C6BED8E3A0"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.03,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A63A7264_BCCD_350C_41CC_1C3A43E75878",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A63A7264_BCCD_350C_41CC_1C3A43E75878_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 781
   }
  ]
 },
 "pitch": 2.69,
 "popupMaxWidth": "95%",
 "yaw": 34.73,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.15,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 818
   }
  ]
 },
 "pitch": 5.31,
 "popupMaxWidth": "95%",
 "yaw": 167.51,
 "showDuration": 500
},
{
 "class": "MediaAudio",
 "autoplay": true,
 "audio": {
  "mp3Url": "media/audio_FCF997E0_BC3F_3B04_41D1_F45CFCD1D836.mp3",
  "class": "AudioResource",
  "oggUrl": "media/audio_FCF997E0_BC3F_3B04_41D1_F45CFCD1D836.ogg"
 },
 "id": "audio_FCF997E0_BC3F_3B04_41D1_F45CFCD1D836",
 "data": {
  "label": "Adi\u00f3s Che Parahe Kue - Emiliano R. Fern\u00e1ndez"
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3245,
   "height": 2482
  },
  {
   "url": "media/popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1566
  },
  {
   "url": "media/popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 783
  },
  {
   "url": "media/popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 391
  }
 ],
 "id": "ImageResource_A9B4AE80_BF1F_4F80_41DF_73D289B3FC43"
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_B5E0181D_B8EE_8E14_41B6_5E4FB3FE0567",
 "id": "panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_camera",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 0,
  "pitch": 0
 }
},
{
 "borderRadius": 0,
 "rollOverBackgroundOpacity": 0.8,
 "fontSize": "26px",
 "shadowBlurRadius": 6,
 "class": "Button",
 "id": "Button_7DB37382_7065_343F_41CC_EC41ABCCDE1B_mobile",
 "pressedBackgroundOpacity": 1,
 "width": "100%",
 "shadowColor": "#000000",
 "fontFamily": "Oswald",
 "label": "Planos",
 "horizontalAlign": "center",
 "paddingRight": 0,
 "backgroundColorRatios": [
  0,
  1
 ],
 "layout": "horizontal",
 "paddingLeft": 10,
 "borderSize": 0,
 "iconBeforeLabel": true,
 "rollOverBackgroundColor": [
  "#5CA1DE"
 ],
 "minHeight": 1,
 "fontColor": "#FFFFFF",
 "click": "this.setComponentVisibility(this.Container_2F8BB687_0D4F_6B7F_4190_9490D02FBC41_mobile, true, 0, null, null, false); this.setComponentVisibility(this.Container_6396DD92_74B8_852E_41C7_7F2F88EAB543_mobile, false, 0, null, null, false)",
 "borderColor": "#000000",
 "gap": 5,
 "rollOverBackgroundColorRatios": [
  0
 ],
 "minWidth": 1,
 "mode": "push",
 "height": 60,
 "paddingBottom": 0,
 "backgroundColor": [
  "#000000",
  "#000000"
 ],
 "backgroundColorDirection": "vertical",
 "fontStyle": "italic",
 "verticalAlign": "middle",
 "propagateClick": true,
 "iconHeight": 32,
 "data": {
  "name": "Button Floorplan"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 32,
 "textDecoration": "none",
 "paddingTop": 0,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0
},
{
 "class": "PanoramaCamera",
 "automaticZoomSpeed": 10,
 "manualZoomSpeed": 2,
 "initialSequence": "this.sequence_A7230AB0_BF1F_7780_41E0_754621EDC7D9",
 "id": "camera_A7233AB0_BF1F_7780_41D8_DE40440493C7",
 "initialPosition": {
  "class": "PanoramaCameraPosition",
  "hfov": 90,
  "yaw": 86.99,
  "pitch": 0
 }
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7257AA0_BCDA_F504_41B5_0019559949D5_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 1826,
   "height": 2136
  },
  {
   "url": "media/popup_A7257AA0_BCDA_F504_41B5_0019559949D5_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1750,
   "height": 2048
  },
  {
   "url": "media/popup_A7257AA0_BCDA_F504_41B5_0019559949D5_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 875,
   "height": 1024
  },
  {
   "url": "media/popup_A7257AA0_BCDA_F504_41B5_0019559949D5_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 437,
   "height": 512
  }
 ],
 "id": "ImageResource_A9E1CEAA_BF1F_4F80_41D4_DA99B986162F"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2296,
   "height": 2502
  },
  {
   "url": "media/popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1879,
   "height": 2048
  },
  {
   "url": "media/popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 939,
   "height": 1024
  },
  {
   "url": "media/popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 469,
   "height": 512
  }
 ],
 "id": "ImageResource_A9D79E9B_BF1F_4F80_41D0_61425AF729F8"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2050,
   "height": 2327
  },
  {
   "url": "media/popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1804,
   "height": 2048
  },
  {
   "url": "media/popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 902,
   "height": 1024
  },
  {
   "url": "media/popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 451,
   "height": 512
  }
 ],
 "id": "ImageResource_A9BACE82_BF1F_4F80_41C8_C91E908128D9"
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.48,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 867
   }
  ]
 },
 "pitch": 3.82,
 "popupMaxWidth": "95%",
 "yaw": 28.25,
 "showDuration": 500
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 3.58,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A0814000_BCDD_1504_41DE_578F53E9F700",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A0814000_BCDD_1504_41DE_578F53E9F700_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 1024,
    "height": 781
   }
  ]
 },
 "pitch": 4.45,
 "popupMaxWidth": "95%",
 "yaw": 77.62,
 "showDuration": 500
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 3324,
   "height": 2528
  },
  {
   "url": "media/popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 2048,
   "height": 1557
  },
  {
   "url": "media/popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 1024,
   "height": 778
  },
  {
   "url": "media/popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 512,
   "height": 389
  }
 ],
 "id": "ImageResource_A9AF3E73_BF1F_4E80_41E2_B9330ADA4E73"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2002,
   "height": 2417
  },
  {
   "url": "media/popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1696,
   "height": 2047
  },
  {
   "url": "media/popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 848,
   "height": 1023
  },
  {
   "url": "media/popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 424,
   "height": 511
  }
 ],
 "id": "ImageResource_A9DCAEA8_BF1F_4F80_41D8_38DF2209280B"
},
{
 "class": "ImageResource",
 "levels": [
  {
   "url": "media/popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F_0_0.jpg",
   "class": "ImageResourceLevel",
   "width": 2129,
   "height": 2360
  },
  {
   "url": "media/popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F_0_1.jpg",
   "class": "ImageResourceLevel",
   "width": 1847,
   "height": 2048
  },
  {
   "url": "media/popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F_0_2.jpg",
   "class": "ImageResourceLevel",
   "width": 923,
   "height": 1024
  },
  {
   "url": "media/popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F_0_3.jpg",
   "class": "ImageResourceLevel",
   "width": 461,
   "height": 512
  }
 ],
 "id": "ImageResource_A9B9DE83_BF1F_4F80_41E1_0E6D223DFBA1"
},
{
 "width": 3970,
 "class": "Photo",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/album_AFD8B361_BEE9_5680_41E1_F954E21E902E.jpg",
    "class": "ImageResourceLevel"
   }
  ]
 },
 "duration": 5000,
 "id": "album_AFD8B361_BEE9_5680_41E1_F954E21E902E",
 "height": 2890
},
{
 "rotationY": 0,
 "class": "PopupPanoramaOverlay",
 "hfov": 2.46,
 "popupDistance": 100,
 "hideEasing": "cubic_out",
 "hideDuration": 500,
 "id": "popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8",
 "rotationX": 0,
 "rotationZ": 0,
 "showEasing": "cubic_in",
 "popupMaxHeight": "95%",
 "image": {
  "class": "ImageResource",
  "levels": [
   {
    "url": "media/popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8_0_2.jpg",
    "class": "ImageResourceLevel",
    "width": 831,
    "height": 1023
   }
  ]
 },
 "pitch": 6.24,
 "popupMaxWidth": "95%",
 "yaw": 150.89,
 "showDuration": 500
},
{
 "class": "Panorama",
 "hfov": 360,
 "label": "Sala de Arte Popular - Tejidos",
 "id": "panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66",
 "adjacentPanoramas": [
  {
   "backwardYaw": 154.35,
   "class": "AdjacentPanorama",
   "yaw": -1.85,
   "distance": 1,
   "panorama": "this.panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA"
  },
  {
   "backwardYaw": -0.6,
   "class": "AdjacentPanorama",
   "yaw": 178.89,
   "distance": 1,
   "panorama": "this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4"
  },
  {
   "backwardYaw": 2.4,
   "class": "AdjacentPanorama",
   "yaw": 179.27,
   "distance": 1,
   "panorama": "this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC"
  },
  {
   "class": "AdjacentPanorama",
   "panorama": "this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3"
  }
 ],
 "pitch": 0,
 "vfov": 180,
 "partial": false,
 "thumbnailUrl": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_t.jpg",
 "frames": [
  {
   "thumbnailUrl": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_t.jpg",
   "class": "CubicPanoramaFrame",
   "front": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/f/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/f/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/f/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/f/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "top": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/u/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/u/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/u/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/u/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "back": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/b/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/b/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/b/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/b/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "bottom": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/d/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/d/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/d/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/d/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "left": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/l/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/l/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/l/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/l/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   },
   "right": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/r/0/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 7,
      "width": 3584,
      "tags": "ondemand",
      "rowCount": 7,
      "height": 3584
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/r/1/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 4,
      "width": 2048,
      "tags": "ondemand",
      "rowCount": 4,
      "height": 2048
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/r/2/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 2,
      "width": 1024,
      "tags": "ondemand",
      "rowCount": 2,
      "height": 1024
     },
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_0/r/3/{row}_{column}.jpg",
      "class": "TiledImageResourceLevel",
      "colCount": 1,
      "width": 512,
      "tags": [
       "ondemand",
       "preload"
      ],
      "rowCount": 1,
      "height": 512
     }
    ]
   }
  }
 ],
 "hfovMin": "140%",
 "overlays": [
  "this.overlay_9DA9988B_BCF5_3504_41E4_C908A798459C",
  "this.overlay_9D244A39_BCF5_F504_41B0_4B48FCBE2EAA",
  "this.overlay_9E7EA252_BCF5_7504_41B4_7A439A69DC9D",
  "this.overlay_9E676EDC_BCF7_0D3C_41E3_2E4F9C7A4A7E",
  "this.overlay_9FBFB35C_BCF7_1B3C_41D0_52DD4DB7AE73",
  "this.overlay_8C2D6A98_BC4B_3504_41C6_985AB15AD2FE",
  "this.overlay_8DD9E2AE_BC4B_151C_41E5_D7A341E28393",
  "this.overlay_8DC61686_BC4B_1D0C_41E2_77B14F6C530D",
  "this.overlay_8DC39958_BC4B_1703_4172_053CBA0DFEA5",
  "this.overlay_8DCBAEA1_BC4B_0D05_41CD_878A24C4978C",
  "this.overlay_8DF8B507_BC4A_FF0C_41E1_C90F40DB1012",
  "this.overlay_8DE6D91F_BC4A_F73C_41E6_758844E20E74"
 ],
 "hfovMax": 130
},
{
 "visible": false,
 "borderRadius": 0,
 "class": "UIComponent",
 "id": "veilPopupPanorama",
 "left": 0,
 "backgroundColorRatios": [
  0
 ],
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 350
 },
 "right": 0,
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": 0,
 "minWidth": 0,
 "bottom": 0,
 "backgroundColor": [
  "#000000"
 ],
 "paddingBottom": 0,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "data": {
  "name": "UIComponent45535"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 0.55
},
{
 "visible": false,
 "borderRadius": 0,
 "class": "ZoomImage",
 "id": "zoomImagePopupPanorama",
 "left": 0,
 "backgroundColorRatios": [],
 "right": 0,
 "paddingRight": 0,
 "paddingLeft": 0,
 "borderSize": 0,
 "minHeight": 0,
 "top": 0,
 "minWidth": 0,
 "bottom": 0,
 "backgroundColor": [],
 "paddingBottom": 0,
 "backgroundColorDirection": "vertical",
 "propagateClick": false,
 "scaleMode": "custom",
 "data": {
  "name": "ZoomImage45536"
 },
 "shadow": false,
 "paddingTop": 0,
 "backgroundOpacity": 1
},
{
 "visible": false,
 "borderRadius": 0,
 "shadowBlurRadius": 6,
 "class": "CloseButton",
 "id": "closeButtonPopupPanorama",
 "layout": "horizontal",
 "backgroundColorRatios": [
  0,
  0.1,
  1
 ],
 "showEffect": {
  "easing": "cubic_in_out",
  "class": "FadeInEffect",
  "duration": 350
 },
 "shadowColor": "#000000",
 "fontFamily": "Arial",
 "right": 10,
 "horizontalAlign": "center",
 "paddingRight": 5,
 "paddingLeft": 5,
 "borderSize": 0,
 "iconLineWidth": 5,
 "rollOverIconColor": "#666666",
 "minHeight": 0,
 "borderColor": "#000000",
 "fontColor": "#FFFFFF",
 "top": 10,
 "iconBeforeLabel": true,
 "minWidth": 0,
 "mode": "push",
 "pressedIconColor": "#888888",
 "backgroundColor": [
  "#DDDDDD",
  "#EEEEEE",
  "#FFFFFF"
 ],
 "paddingBottom": 5,
 "gap": 5,
 "fontSize": "1.29vmin",
 "backgroundColorDirection": "vertical",
 "label": "",
 "fontStyle": "normal",
 "propagateClick": false,
 "verticalAlign": "middle",
 "iconColor": "#000000",
 "iconHeight": 20,
 "data": {
  "name": "CloseButton45537"
 },
 "shadow": false,
 "shadowSpread": 1,
 "iconWidth": 20,
 "textDecoration": "none",
 "paddingTop": 5,
 "cursor": "hand",
 "fontWeight": "normal",
 "backgroundOpacity": 0.3
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -7.03,
   "hfov": 9.6,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 31
     }
    ]
   },
   "pitch": -11.54
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.6,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 272,
      "height": 537
     }
    ]
   },
   "pitch": -11.54,
   "yaw": -7.03
  }
 ],
 "id": "overlay_AFFBBF16_BC35_0B0C_41E3_D513F6A7C1B1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873, this.camera_A836B8E7_BF1F_7380_41E6_2176F6537E72); this.mainPlayList.set('selectedIndex', 6)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 4.15,
   "hfov": 6.84,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 35
     }
    ]
   },
   "pitch": -3.64
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.84,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 190,
      "height": 420
     }
    ]
   },
   "pitch": -3.64,
   "yaw": 4.15
  }
 ],
 "id": "overlay_A891A2A0_BC35_3504_41D0_85B70BACCED1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B, this.camera_A839E8F8_BF1F_7380_41D1_F4439E2719AB); this.mainPlayList.set('selectedIndex', 7)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -64.17,
   "hfov": 11.54,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 21
     }
    ]
   },
   "pitch": -8.63
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.54,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 324,
      "height": 431
     }
    ]
   },
   "pitch": -8.63,
   "yaw": -64.17
  }
 ],
 "id": "overlay_A9737201_BC4B_1504_41BC_1C7DF205DFA8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 8)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 111.29,
   "hfov": 4.11,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 24.6
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.11,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 24.6,
   "yaw": 111.29
  }
 ],
 "id": "overlay_9FEA00AC_BCCB_151C_41C0_0B2D2C40D004",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9FB2A40F_BCCB_3D1C_41D3_A6CC50E1D4DD, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A04E6C_BF1F_4E80_41E2_2B5E086FB8FF, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 111.39,
   "hfov": 4.5,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.81
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.5,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 4.81,
   "yaw": 111.39
  }
 ],
 "id": "overlay_9FB47C12_BCCB_0D04_4198_80C208D570C7",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9FA40BE4_BCCB_0B0C_41E4_3C9628F2F0F1, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A75E6D_BF1F_4E80_41E1_B70586E22392, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 54.09,
   "hfov": 4.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 12.25
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.42,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 12.25,
   "yaw": 54.09
  }
 ],
 "id": "overlay_9FF72AB9_BCCD_1504_41DC_CD266E51E96A",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9FE21A8C_BCCD_151C_41E1_93BA5252A1D5, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A63E6E_BF1F_4E80_41D2_37F22CFA9900, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 16.68,
   "hfov": 8.88,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": -15.92
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.88,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 256,
      "height": 235
     }
    ]
   },
   "pitch": -15.92,
   "yaw": 16.68
  }
 ],
 "id": "overlay_9FE09F4A_BCCD_0B04_419A_9F04DBD9B682",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9F925F1C_BCCD_0B3C_41E2_36F576BD6EAB, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A57E6E_BF1F_4E80_41D9_A77497B652A2, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -168.41,
   "hfov": 16.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 22
     }
    ]
   },
   "pitch": -12.97
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 16.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 476,
      "height": 663
     }
    ]
   },
   "pitch": -12.97,
   "yaw": -168.41
  }
 ],
 "id": "overlay_9B3509B7_BCD7_370C_41E3_18DA809B2009",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23, this.camera_A82E98CA_BF1F_7380_41C2_5941B8ACDBDA); this.mainPlayList.set('selectedIndex', 4)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7DDFBAE_BF1F_7580_41DE_50731FF10212",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1B81E_B8EE_8E14_4199_02C3916922CB",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1D81E_B8EE_8E14_418C_DA8A1A4AAA66",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -0.95,
   "hfov": 11.03,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 26
     }
    ]
   },
   "pitch": -12.76
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.03,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 314,
      "height": 511
     }
    ]
   },
   "pitch": -12.76,
   "yaw": -0.95
  }
 ],
 "id": "overlay_A94B2488_BC4A_FD04_41E4_2500E620FD26",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B, this.camera_A8DD0A54_BF1F_7680_41BE_BCF1640C5FB2); this.mainPlayList.set('selectedIndex', 7)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 156.1,
   "hfov": 12.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 41
     }
    ]
   },
   "pitch": -7.62
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 341,
      "height": 874
     }
    ]
   },
   "pitch": -7.62,
   "yaw": 156.1
  }
 ],
 "id": "overlay_AA5D31C3_BC4D_3704_41A3_FDFDA25BF794",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0, this.camera_A8E90A64_BF1F_7680_41CF_7CD18FBE1ADE); this.mainPlayList.set('selectedIndex', 5)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 169.38,
   "hfov": 7.94,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 50
     }
    ]
   },
   "pitch": -6.05
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.94,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 221,
      "height": 699
     }
    ]
   },
   "pitch": -6.05,
   "yaw": 169.38
  }
 ],
 "id": "overlay_A9B6BCE1_BC4D_0D04_41C2_C66878955848",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23, this.camera_A8FC2A81_BF1F_7780_41E5_CEA1E269BA5A); this.mainPlayList.set('selectedIndex', 4)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 134.35,
   "hfov": 4.38,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 14.31
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.38,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 14.31,
   "yaw": 134.35
  }
 ],
 "id": "overlay_901BC594_BC37_7F0C_41BA_D1FB199C3765",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9016954C_BC37_7F1C_41D5_CAE205CAD0C9, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A4FE70_BF1F_4E80_41C5_60F94634F2E7, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 134.16,
   "hfov": 3.56,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.24
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.56,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 99,
      "height": 99
     }
    ]
   },
   "pitch": 2.24,
   "yaw": 134.16
  }
 ],
 "id": "overlay_901BD595_BC37_7F0C_41DB_7F0E62F173A4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9017054F_BC37_7F1C_41CD_9E79E5C22836, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9ABFE71_BF1F_4E80_41D6_347C3D22E1DD, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 92.01,
   "hfov": 4.4,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 12.92
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.4,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 12.92,
   "yaw": 92.01
  }
 ],
 "id": "overlay_901BD595_BC37_7F0C_41E2_732CA44E9E21",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_90173551_BC37_7F04_41C9_80B87737433F, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9AAFE71_BF1F_4E80_41AA_5D7E005F68BF, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 142.28,
   "hfov": 8.89,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": -15.67
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.89,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 256,
      "height": 235
     }
    ]
   },
   "pitch": -15.67,
   "yaw": 142.28
  }
 ],
 "id": "overlay_901BE595_BC37_7F0C_41D8_081EC58E5660",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9017E552_BC37_7F04_41A5_19434122D6E1, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A83E72_BF1F_4E80_41DB_434A60BC4955, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 147.87,
   "hfov": 3.53,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 7.67
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.53,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 99,
      "height": 99
     }
    ]
   },
   "pitch": 7.67,
   "yaw": 147.87
  }
 ],
 "id": "overlay_8DA4043F_BC37_1D7C_41D7_AC7A7D9CF720",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_8DB183FB_BC37_1B04_41CA_F4B57D73581B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9AF3E73_BF1F_4E80_41E2_B9330ADA4E73, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 43.99,
   "hfov": 2.79,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -22.55
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 83,
      "height": 80
     }
    ]
   },
   "pitch": -22.55,
   "yaw": 43.99
  }
 ],
 "id": "overlay_9A17174C_BC35_1B1C_41E5_5B7231D574D0",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9A23171D_BC35_1B3C_41E4_F53EEBEBB099, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A8BE74_BF1F_4E80_41E0_E95DF5181D28, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 58.84,
   "hfov": 2.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -21.76
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.8,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 83,
      "height": 80
     }
    ]
   },
   "pitch": -21.76,
   "yaw": 58.84
  }
 ],
 "id": "overlay_9BBAC0A4_BC35_150C_41E2_F90CE2D4ECC1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9BB5C075_BC35_150C_41D5_56C7BD185F99, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9AF8E75_BF1F_4E80_41DA_7B63C45B871E, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 45.65,
   "hfov": 2.65,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_10_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -28.42
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.65,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_10_0.png",
      "class": "ImageResourceLevel",
      "width": 83,
      "height": 80
     }
    ]
   },
   "pitch": -28.42,
   "yaw": 45.65
  }
 ],
 "id": "overlay_9A74F26F_BC3B_151C_41D4_A2DD2D3AD121",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9A79123D_BC3B_157C_41C1_B207E716906B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9AE9E76_BF1F_4E80_41D4_CB3F61335F18, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 50.99,
   "hfov": 2.12,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_11_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -20.29
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.12,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873_1_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 62,
      "height": 61
     }
    ]
   },
   "pitch": -20.29,
   "yaw": 50.99
  }
 ],
 "id": "overlay_9A35C3FD_BC3B_1AFC_41E4_34F745E13821",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9A3AD3C8_BC3B_1B04_41B4_DE051F9B4669, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9AD8E77_BF1F_4E80_41D5_4E0D67AAC50B, null, null, null, null, false)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7CB4B90_BF1F_7580_41C9_0A664B7EB470",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 154.35,
   "hfov": 10.52,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 34
     }
    ]
   },
   "pitch": -4.69
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.52,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 293,
      "height": 630
     }
    ]
   },
   "pitch": -4.69,
   "yaw": 154.35
  }
 ],
 "id": "overlay_9EF1B7C3_BCF5_1B04_41E1_60CD368A87B4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66, this.camera_A7E80BBD_BF1F_7580_41C1_98456D6E8AE5); this.mainPlayList.set('selectedIndex', 14)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -5.65,
 "bleachingDistance": 0.4,
 "pitch": 42.52,
 "bleaching": 0.7,
 "id": "overlay_8DD63674_BC75_3D0C_41D8_4E49BF202257"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 148.85,
 "bleachingDistance": 0.4,
 "pitch": 29.71,
 "bleaching": 0.7,
 "id": "overlay_8DF382B3_BC75_1504_41BA_99DE839F2439"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1F81D_B8EE_8E17_41C2_20835DB2689F",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 177.7,
   "hfov": 11.66,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 41
     }
    ]
   },
   "pitch": -18.66
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.66,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 341,
      "height": 874
     }
    ]
   },
   "pitch": -18.66,
   "yaw": 177.7
  }
 ],
 "id": "overlay_A97DA307_BC4F_1B0D_41B8_88D69897D978",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873, this.camera_A60CFBEA_BF1F_7580_41CE_96038FF946C1); this.mainPlayList.set('selectedIndex', 6)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 165.44,
   "hfov": 7.83,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 33
     }
    ]
   },
   "pitch": -3.29
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.83,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 217,
      "height": 455
     }
    ]
   },
   "pitch": -3.29,
   "yaw": 165.44
  }
 ],
 "id": "overlay_AA0B5962_BC4D_1704_41C3_9A18E8BAFF32",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0, this.camera_A7F54BCC_BF1F_7580_41D0_9240E8A78EA0); this.mainPlayList.set('selectedIndex', 5)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 149.29,
   "hfov": 2.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 9.08
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 76,
      "height": 71
     }
    ]
   },
   "pitch": 9.08,
   "yaw": 149.29
  }
 ],
 "id": "overlay_9AA9A485_BC3D_7D0C_41D2_870A0132BE00",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9ABAD445_BC3D_7D0C_41D3_2038AF91040B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9ACEE78_BF1F_4E80_41E2_4BC6DC0ACBBD, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 149.26,
   "hfov": 2.33,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.6
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.33,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 64,
      "height": 63
     }
    ]
   },
   "pitch": 1.6,
   "yaw": 149.26
  }
 ],
 "id": "overlay_9AA9B485_BC3D_7D0C_41E6_327625FA1539",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9ABA4447_BC3D_7D0C_41E1_E690ADB673CE, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B21E79_BF1F_4E80_41D4_43691F67FB21, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 131.76,
   "hfov": 4.46,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 9.5
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.46,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 9.5,
   "yaw": 131.76
  }
 ],
 "id": "overlay_9AA94485_BC3D_7D0C_41DC_A9FE86A803AA",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9ABA7448_BC3D_7D04_41DD_98212CB2771B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B11E7A_BF1F_4E80_41DA_3BB6103F75ED, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 156.49,
   "hfov": 5.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 19,
      "height": 16
     }
    ]
   },
   "pitch": -5.61
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 145,
      "height": 121
     }
    ]
   },
   "pitch": -5.61,
   "yaw": 156.49
  }
 ],
 "id": "overlay_9AA95485_BC3D_7D0C_41D3_ACCECAD491FF",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9ABA2449_BC3D_7D04_41CA_02936834E8B4, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B01E7B_BF1F_4E80_41CC_C2E81E1F1300, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 158.22,
   "hfov": 2.36,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 17
     }
    ]
   },
   "pitch": 4.68
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.36,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B59DA5B2_B8D2_862C_41E3_062EE7303D8B_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 65,
      "height": 72
     }
    ]
   },
   "pitch": 4.68,
   "yaw": 158.22
  }
 ],
 "id": "overlay_9AA96485_BC3D_7D0C_41D0_C18FE727E332",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9ABDE44A_BC3D_7D04_41E1_F1A02011F42A, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B70E7C_BF1F_4E80_41CD_8EC8BEFB68AD, null, null, null, null, false)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_9E29D761_BF1F_7E83_41AB_8412EB7C16B9",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PhotoPlayList",
 "items": [
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B3714AB2_BEEF_5780_419E_CCE1C76FC3E0",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.54",
     "zoomFactor": 1.1,
     "y": "0.62"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B19B411D_BEEF_3280_41B1_BF001AC547B0",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.33",
     "zoomFactor": 1.1,
     "y": "0.35"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B1435CAC_BEEF_3381_41D0_75330430225B",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.71",
     "zoomFactor": 1.1,
     "y": "0.72"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AE11651D_BEEF_D280_41DB_FDCAD2C25EA1",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.65",
     "zoomFactor": 1.1,
     "y": "0.58"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B310E90A_BEEE_D280_41DD_AF2A5BD7EFF6",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.58",
     "zoomFactor": 1.1,
     "y": "0.52"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B0A52F96_BEE9_CD80_41CA_06DC332482DD",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.36",
     "zoomFactor": 1.1,
     "y": "0.33"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AE7D4AB8_BEE9_F780_41AE_7104144080FE",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.34",
     "zoomFactor": 1.1,
     "y": "0.56"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AE748E57_BEE9_CE80_41D5_9AE4A8AFDAC4",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.25",
     "zoomFactor": 1.1,
     "y": "0.58"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AE23F183_BEE9_5580_41E7_97BE76F0D82B",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.55",
     "zoomFactor": 1.1,
     "y": "0.48"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B0EDA51D_BEE9_7283_41D1_795D8D9BDB7C",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.43",
     "zoomFactor": 1.1,
     "y": "0.54"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AFD8B361_BEE9_5680_41E1_F954E21E902E",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.30",
     "zoomFactor": 1.1,
     "y": "0.44"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AE8494BB_BEE9_3380_41D0_6262088A18B6",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.45",
     "zoomFactor": 1.1,
     "y": "0.25"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_B3486116_BEEA_F280_41E6_3D297359CA21",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.45",
     "zoomFactor": 1.1,
     "y": "0.45"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  },
  {
   "class": "PhotoPlayListItem",
   "media": "this.album_AEF09A22_BEEA_D680_41D5_CEA12B943BF4",
   "camera": {
    "class": "MovementPhotoCamera",
    "easing": "linear",
    "targetPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.25",
     "zoomFactor": 1.1,
     "y": "0.61"
    },
    "initialPosition": {
     "class": "PhotoCameraPosition",
     "x": "0.50",
     "zoomFactor": 1,
     "y": "0.50"
    },
    "duration": 5000,
    "scaleMode": "fit_outside"
   }
  }
 ],
 "id": "album_ACD0A618_BD0B_C4C9_41D4_A1949BC36882_AlbumPlayList"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A8A3F9FA_BF1F_7580_41C9_5E37C9016366",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A86EE98B_BF1F_7580_41C8_296284A1995D",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_9E397770_BF1F_7E81_41D7_89CFC97724CD",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -90.77,
   "hfov": 9.34,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -11.25
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.34,
   "image": "this.AnimatedImageResource_9DBBDE3D_BD16_44CB_41D1_1152FB8FA7BB",
   "yaw": -90.77,
   "pitch": -11.25,
   "distance": 100
  }
 ],
 "id": "overlay_AB145AF5_BC55_150C_4195_2268B618F25E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2, this.camera_A7355ACF_BF1F_7780_41D4_62FA800490DB); this.mainPlayList.set('selectedIndex', 3)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -89.01,
   "hfov": 6.89,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -8.32
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.89,
   "image": "this.AnimatedImageResource_9DBBFE3D_BD16_44CB_41DF_5315A38276AC",
   "yaw": -89.01,
   "pitch": -8.32,
   "distance": 100
  }
 ],
 "id": "overlay_ABA66A51_BC55_1504_41C0_0C906CD039BC",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF, this.camera_A74E5AEC_BF1F_7780_41A3_4AD1DB16528E); this.mainPlayList.set('selectedIndex', 2)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -88.14,
   "hfov": 4.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -6.21
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.43,
   "image": "this.AnimatedImageResource_9DBC1E3D_BD16_44CB_41E2_CB24AD6D749D",
   "yaw": -88.14,
   "pitch": -6.21,
   "distance": 100
  }
 ],
 "id": "overlay_A4648909_BC55_1704_41C9_0E9B81E1FF4C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 1)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 9.9,
   "hfov": 4.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 12.16
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.42,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 125,
      "height": 125
     }
    ]
   },
   "pitch": 12.16,
   "yaw": 9.9
  }
 ],
 "id": "overlay_A5B7CFE0_BC55_0B03_41B4_9DE09025A9C6",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A4DDFB8E_BC55_0B1F_41D0_92BF0F6FA957, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B69E7D_BF1F_4E80_41DB_07D87A87CBB9, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 126.38,
   "hfov": 2.77,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 9.86
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.77,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 77,
      "height": 76
     }
    ]
   },
   "pitch": 9.86,
   "yaw": 126.38
  }
 ],
 "id": "overlay_A4F36C2A_BC55_0D04_41E4_BCE454120120",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A4EE1C03_BC55_0D04_41E5_4EF04EE327E4, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B56E7E_BF1F_4E80_41B3_F37731E41E3A, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 161.89,
   "hfov": 2.78,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 8.1
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.78,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 77,
      "height": 76
     }
    ]
   },
   "pitch": 8.1,
   "yaw": 161.89
  }
 ],
 "id": "overlay_A4C8E1FC_BC5B_36FC_41E3_9A88F6E1BD76",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A43CB1D3_BC5B_3705_41E1_326E04450D1E, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_96F46DDE_BCD5_0F3C_41D1_850B36FDED61, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 92.09,
   "hfov": 12.17,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 23
     }
    ]
   },
   "pitch": -7.79
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.17,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 341,
      "height": 494
     }
    ]
   },
   "pitch": -7.79,
   "yaw": 92.09
  }
 ],
 "id": "overlay_A4A4C413_BC5B_FD04_41DB_AA056715BAD5",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5, this.camera_A7676B09_BF1F_7680_418D_3D5C25449A91); this.mainPlayList.set('selectedIndex', 9)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A83688E7_BF1F_7380_41E6_D62DE23741B5",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A880B9B7_BF1F_7580_41E5_D3B8F495E81B",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_9E9D37CB_BF1F_7D87_41E4_986DCDAF5AF2",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -179.84,
   "hfov": 7.47,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 31
     }
    ]
   },
   "pitch": -7.37
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.47,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 209,
      "height": 406
     }
    ]
   },
   "pitch": -7.37,
   "yaw": -179.84
  }
 ],
 "id": "overlay_A4931BD0_BC5D_0B04_41D4_5BD23DA52AC0",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD, this.camera_A8462918_BF1F_7280_41DB_08BCD771B817); this.mainPlayList.set('selectedIndex', 8)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -85.06,
   "hfov": 10.08,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 27
     }
    ]
   },
   "pitch": -7.66
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.08,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 282,
      "height": 491
     }
    ]
   },
   "pitch": -7.66,
   "yaw": -85.06
  }
 ],
 "id": "overlay_A59A21E2_BC5D_3704_41E0_3B7650900A4E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3, this.camera_A83C0907_BF1F_7280_41A1_3E50F68DF3B9); this.mainPlayList.set('selectedIndex', 10)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -112,
   "hfov": 2.9,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 6.37
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.9,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 81,
      "height": 95
     }
    ]
   },
   "pitch": 6.37,
   "yaw": -112
  }
 ],
 "id": "overlay_A52FA283_BC5D_7504_41D2_E7FE7D1B7BFC",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A51E152E_BC5D_3F1C_41C0_967DEF98B8A3, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B4AE80_BF1F_4F80_41DF_73D289B3FC43, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -128,
   "hfov": 2.28,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 5.73
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.28,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 63,
      "height": 72
     }
    ]
   },
   "pitch": 5.73,
   "yaw": -128
  }
 ],
 "id": "overlay_A50A4F56_BC5F_0B0C_4193_4C2843DFE9AD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5797F2A_BC5F_0B04_41C1_C43AA4915DA9, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9BBCE81_BF1F_4F80_41D6_342186F94CBD, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -149.04,
   "hfov": 2.28,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 7.09
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.28,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 63,
      "height": 72
     }
    ]
   },
   "pitch": 7.09,
   "yaw": -149.04
  }
 ],
 "id": "overlay_A52ADD14_BC5F_0F0C_41E4_0FF0C3FF8957",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A51E2CEA_BC5F_0D04_41E0_BCBAF655D554, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9BACE82_BF1F_4F80_41C8_C91E908128D9, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -46.78,
   "hfov": 2.88,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 9.02
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.88,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 81,
      "height": 95
     }
    ]
   },
   "pitch": 9.02,
   "yaw": -46.78
  }
 ],
 "id": "overlay_985A9B7F_BC55_0BFC_41DF_572606765297",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_9FA59B52_BC55_0B04_41E2_9494ADED8E8F, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B9DE83_BF1F_4F80_41E1_0E6D223DFBA1, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -14.9,
   "hfov": 2.88,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 9.77
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.88,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 81,
      "height": 95
     }
    ]
   },
   "pitch": 9.77,
   "yaw": -14.9
  }
 ],
 "id": "overlay_A5DB74AC_BC55_3D1C_41E4_6A7384C08D9D",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5C7447B_BC55_3D04_41E1_7FE7748D2CD0, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9B8DE83_BF1F_4F80_41DF_D33FB92DC3E1, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 10.49,
   "hfov": 3.47,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 18
     }
    ]
   },
   "pitch": 12.35
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.47,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 111
     }
    ]
   },
   "pitch": 12.35,
   "yaw": 10.49
  }
 ],
 "id": "overlay_A5EB7BF3_BC4B_0B04_41D3_2B8766F87AA8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5FF5BCB_BC4B_0B04_41DE_1FBFA4A3A414, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9BFDE84_BF1F_4F80_41DD_DA8651654F4D, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 31.82,
   "hfov": 3.49,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 18
     }
    ]
   },
   "pitch": 10.14
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.49,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 111
     }
    ]
   },
   "pitch": 10.14,
   "yaw": 31.82
  }
 ],
 "id": "overlay_A5E95EEC_BC4B_0D1C_41CC_AA621080C6AD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5FDFEC3_BC4B_0D04_41CF_E02D1EFE0747, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9BECE85_BF1F_4F80_41D0_E4A0293CEB62, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 80.84,
   "hfov": 3.47,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 18
     }
    ]
   },
   "pitch": 11.92
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.47,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 111
     }
    ]
   },
   "pitch": 11.92,
   "yaw": 80.84
  }
 ],
 "id": "overlay_A591FAE2_BC4B_1504_41D8_5048BF5C5BDC",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5E53ABA_BC4B_1504_41DF_F72A92B3684E, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9BDEE86_BF1F_4F80_41E4_683F4180878B, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 108.04,
   "hfov": 3.48,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_10_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 18
     }
    ]
   },
   "pitch": 11.7
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.48,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_10_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 111
     }
    ]
   },
   "pitch": 11.7,
   "yaw": 108.04
  }
 ],
 "id": "overlay_A6318D4E_BC4B_0F1C_41D3_E557F6943ECB",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A64DDD24_BC4B_0F0C_4168_A0E0F58CB57B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C31E87_BF1F_4F80_41E2_A440E2E62115, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 128.4,
   "hfov": 3.08,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_11_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 7.84
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.08,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 86,
      "height": 99
     }
    ]
   },
   "pitch": 7.84,
   "yaw": 128.4
  }
 ],
 "id": "overlay_A5C0AC40_BC3B_0D04_41E1_E5619AAB4C31",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5D10C14_BC3B_0D0C_41E2_BEE604B6DC00, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C3FE88_BF1F_4F80_41E5_8A186C879443, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 155.3,
   "hfov": 2.48,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_12_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 19
     }
    ]
   },
   "pitch": 6.63
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.48,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B599D066_B8D2_BE35_41E3_25891358CFE5_1_HS_12_0.png",
      "class": "ImageResourceLevel",
      "width": 69,
      "height": 83
     }
    ]
   },
   "pitch": 6.63,
   "yaw": 155.3
  }
 ],
 "id": "overlay_A67D7315_BC3D_1B0C_41E0_B9690B12C111",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A580E2EB_BC3D_1504_41E6_55B64C5C8BBC, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C38E89_BF1F_4F80_41E5_DDC343A66275, null, null, null, null, false)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A876099A_BF1F_7580_4183_AA59A55ADE78",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1281E_B8EE_8E14_41D2_E400F34ECC94",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A87879A8_BF1F_7580_41D1_23345701C6D4",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1981E_B8EE_8E14_41E4_85986390B089",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_9E48077F_BF1F_7D7F_41D5_63E0BDD64027",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A89109D6_BF1F_7580_41C1_5B96324C87B3",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 176.82,
   "hfov": 8.69,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 29
     }
    ]
   },
   "pitch": -8.6
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.69,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 244,
      "height": 455
     }
    ]
   },
   "pitch": -8.6,
   "yaw": 176.82
  }
 ],
 "id": "overlay_A6674F6C_BC3F_0B1C_41A8_5C318FCE1E92",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B599D066_B8D2_BE35_41E3_25891358CFE5, this.camera_A88AD9C7_BF1F_7580_41BF_BA9AD8A7D09C); this.mainPlayList.set('selectedIndex', 9)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 124.42,
   "hfov": 3.49,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 12.65
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.49,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 99,
      "height": 114
     }
    ]
   },
   "pitch": 12.65,
   "yaw": 124.42
  }
 ],
 "id": "overlay_A71EF648_BC3F_1D04_41E3_693DCDF2B956",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A6639F2D_BC3F_0B1C_41E5_42C1BA7319CD, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C2CE8A_BF1F_4F80_41DC_0823EB01ADB4, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 93.02,
   "hfov": 3.43,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 16.92
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.43,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 99,
      "height": 114
     }
    ]
   },
   "pitch": 16.92,
   "yaw": 93.02
  }
 ],
 "id": "overlay_A653AB05_BC3D_0B0C_41C9_5214ACE33543",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A6627ADB_BC3E_F504_41E5_7F8CBFF3D706, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C1CE8A_BF1F_4F80_41E1_2755F6C87FB6, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 57.13,
   "hfov": 3.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 15.06
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 88,
      "height": 99
     }
    ]
   },
   "pitch": 15.06,
   "yaw": 57.13
  }
 ],
 "id": "overlay_A652D39D_BC3D_1B3C_41DF_667C91A31F05",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A660F373_BC3D_1B04_41D2_A4AA500B4F81, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C0EE8B_BF1F_4F80_41AE_3D39159E453F, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 31.84,
   "hfov": 2.79,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 7.35
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 78,
      "height": 90
     }
    ]
   },
   "pitch": 7.35,
   "yaw": 31.84
  }
 ],
 "id": "overlay_A67AE874_BC3B_150C_41C9_CA5AADD64AD4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5875843_BC3B_1504_41CF_71FD3606FBC4, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C7FE8C_BF1F_4F80_41BB_146B4AE8441A, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -120.8,
   "hfov": 3.23,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 12.54
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.23,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 91,
      "height": 96
     }
    ]
   },
   "pitch": 12.54,
   "yaw": -120.8
  }
 ],
 "id": "overlay_A629C9A5_BC3B_170C_41B2_F7BC68977A34",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A635297B_BC3B_1704_41BC_C8D79BA1AFE0, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C6FE8E_BF1F_4F80_41C3_4B6B4FC1EDFE, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -144.96,
   "hfov": 3.44,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 12.86
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.44,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 97,
      "height": 99
     }
    ]
   },
   "pitch": 12.86,
   "yaw": -144.96
  }
 ],
 "id": "overlay_A5A51734_BC3B_1B03_41C7_0A0ECFF258D7",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A5B14704_BC3B_1B03_417B_D212E161463C, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C5FE8E_BF1F_4F80_41D9_F88DEAA84640, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -93.01,
   "hfov": 14.98,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -14.41
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 14.98,
   "image": "this.AnimatedImageResource_9DBF5E41_BD16_44BB_41DF_A04F7860B566",
   "yaw": -93.01,
   "pitch": -14.41,
   "distance": 100
  }
 ],
 "id": "overlay_A712B940_BC35_3704_41E0_AF16CE58FAA4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA, this.camera_A89139D6_BF1F_7580_41E4_246B17AB4D82); this.mainPlayList.set('selectedIndex', 11)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -92.72,
   "hfov": 9.84,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -9.88
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.84,
   "image": "this.AnimatedImageResource_9DBF7E41_BD16_44BB_41D2_9BC44BE521E0",
   "yaw": -92.72,
   "pitch": -9.88,
   "distance": 100
  }
 ],
 "id": "overlay_A5DE68BE_BC35_157C_41E1_6C84B9D29DA9",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4, this.camera_A89B59E7_BF1F_7580_41B7_3A79770E8318); this.mainPlayList.set('selectedIndex', 12)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -92.8,
   "hfov": 6.57,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -6.49
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.57,
   "image": "this.AnimatedImageResource_9DBFAE41_BD16_44BB_41E1_1CD82E32EF4D",
   "yaw": -92.8,
   "pitch": -6.49,
   "distance": 100
  }
 ],
 "id": "overlay_A6D7087D_BC35_75FD_41CB_B82CB0043F09",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC, this.camera_A8A3E9FA_BF1F_7580_41CC_484E1892610F); this.mainPlayList.set('selectedIndex', 13)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -79.01,
 "bleachingDistance": 0.4,
 "pitch": 46.54,
 "bleaching": 0.7,
 "id": "overlay_8D6FB774_BC4B_3B0C_41CC_816828372114"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -10.17,
 "bleachingDistance": 0.4,
 "pitch": 50.31,
 "bleaching": 0.7,
 "id": "overlay_8D11CD44_BC4B_0F0C_41D9_726F4D5492C7"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 63.94,
 "bleachingDistance": 0.4,
 "pitch": 46.79,
 "bleaching": 0.7,
 "id": "overlay_8D0345ED_BC4B_1F1C_41C2_06504EF06B39"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5FEF81F_B8EE_8E14_41E0_95A1C6C2E1B9",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A83C1907_BF1F_7280_41E7_C71A56B1365F",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A8BC5A26_BF1F_7680_41DD_BCCE3D9E6A97",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A76DEB19_BF1F_7680_41E4_8C58C59F6352",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -103.05,
   "hfov": 4.06,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.68
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.06,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 6.68,
   "yaw": -103.05
  }
 ],
 "id": "overlay_A7252576_BC35_1F0C_41DB_0CC73054CE75",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A772B107_BC35_170D_41E5_20064B709D84, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9CB8E90_BF1F_4F80_41E6_53E85D08DBE0, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -85.65,
   "hfov": 4.07,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.94
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.07,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 5.94,
   "yaw": -85.65
  }
 ],
 "id": "overlay_A6945E0E_BC35_0D1C_41D5_C169D635CECD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A6A17DE3_BC35_0F04_41CC_99F5756D51A1, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9CA8E91_BF1F_4F80_41E2_381E286B43E1, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -118.43,
   "hfov": 4.06,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.79
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.06,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 6.79,
   "yaw": -118.43
  }
 ],
 "id": "overlay_A6CCE463_BC35_1D04_41DA_92EE30967B44",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A6D8C434_BC35_1D0C_41D7_F62463FE8507, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C98E91_BF1F_4F80_41DD_9A7E555FCB62, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -138.25,
   "hfov": 3.7,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 15
     }
    ]
   },
   "pitch": 8.48
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.7,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 103,
      "height": 98
     }
    ]
   },
   "pitch": 8.48,
   "yaw": -138.25
  }
 ],
 "id": "overlay_A77D8116_BC35_170C_41E0_3962F804B519",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A68950EB_BC35_151B_41E6_C7C796EB1F5B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C95E93_BF1F_4F80_41DF_5F22D3F34F47, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -150.19,
   "hfov": 3.72,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 15
     }
    ]
   },
   "pitch": 6.77
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.72,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 103,
      "height": 98
     }
    ]
   },
   "pitch": 6.77,
   "yaw": -150.19
  }
 ],
 "id": "overlay_A63BE931_BCCB_1704_41DB_B9CA165B01BA",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A62FF904_BCCB_170C_41E6_F995F1691FDC, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9C82E94_BF1F_4F80_41E3_56C6BED8E3A0, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -71.74,
   "hfov": 4.08,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.97
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.08,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 4.97,
   "yaw": -71.74
  }
 ],
 "id": "overlay_A7A9F53F_BCCB_3F7C_4188_CF428F838435",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A79DC513_BCCB_3F04_41C6_F86CA962705F, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9CF4E94_BF1F_4F80_41D4_1E32C3F4AC1A, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 153.55,
   "hfov": 4.01,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 11.14
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.01,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 11.14,
   "yaw": 153.55
  }
 ],
 "id": "overlay_A7C40D8E_BCCB_0F1C_41CD_53FC4BFABC4C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7B85D63_BCCB_0F04_41E4_DF8523A2EAA9, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9CE4E95_BF1F_4F80_41BB_C99F33DB0A68, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 123.76,
   "hfov": 4.01,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 11.2
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.01,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 11.2,
   "yaw": 123.76
  }
 ],
 "id": "overlay_A65EDB33_BCCB_0B04_41E1_B7D4CD1EA83B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A652AB05_BCCB_0B0C_41E3_35B4F9D61321, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9CD4E96_BF1F_4F80_41E3_7946DBFD2044, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 59.71,
   "hfov": 4.08,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.94
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.08,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 4.94,
   "yaw": 59.71
  }
 ],
 "id": "overlay_A7A4435E_BCCD_1B3C_41CF_7543AC3F0217",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7989333_BCCD_1B04_41E7_2492A6BC59B8, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9CC7E97_BF1F_4F80_41DD_24EE2610BDDC, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 45.14,
   "hfov": 3.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 5.15
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 103,
      "height": 93
     }
    ]
   },
   "pitch": 5.15,
   "yaw": 45.14
  }
 ],
 "id": "overlay_A7A107D7_BCCD_3B0C_41D0_AB4CA5B3781A",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A795B7AC_BCCD_3B1C_41E2_50B91861CEE6, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D37E98_BF1F_4F80_41D5_E31FC1D62238, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 34.73,
   "hfov": 3.03,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_10_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.69
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.03,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_10_0.png",
      "class": "ImageResourceLevel",
      "width": 84,
      "height": 84
     }
    ]
   },
   "pitch": 2.69,
   "yaw": 34.73
  }
 ],
 "id": "overlay_A6467291_BCCD_3504_41D8_BC54798DA583",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A63A7264_BCCD_350C_41CC_1C3A43E75878, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D24E99_BF1F_4F80_41DB_C621D60A724B, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 28.25,
   "hfov": 2.48,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_11_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.82
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.48,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 68,
      "height": 70
     }
    ]
   },
   "pitch": 3.82,
   "yaw": 28.25
  }
 ],
 "id": "overlay_A78C0393_BCCD_1B04_41AE_F9E792BFC46E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A783A36B_BCCD_1B04_41E1_B8C29269CB1D, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D17E9A_BF1F_4F80_4147_622AAE863222, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 12.24,
   "hfov": 2.52,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_12_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 4.55
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.52,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_12_0.png",
      "class": "ImageResourceLevel",
      "width": 70,
      "height": 65
     }
    ]
   },
   "pitch": 4.55,
   "yaw": 12.24
  }
 ],
 "id": "overlay_A64612FF_BCCF_1AFC_41BF_55CB326FB9A5",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A63A12D4_BCCF_150C_41C0_F57F6126B0BF, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D06E9A_BF1F_4F80_41C6_6E68472167B7, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -10.07,
   "hfov": 1.89,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_13_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 1.26
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.89,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_13_0.png",
      "class": "ImageResourceLevel",
      "width": 52,
      "height": 47
     }
    ]
   },
   "pitch": 1.26,
   "yaw": -10.07
  }
 ],
 "id": "overlay_A790FF49_BCCF_0B04_41CC_61638F8FFF9E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7854F1C_BCCF_0B3C_41C1_6FA533B8A5CB, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D79E9B_BF1F_4F80_41D0_61425AF729F8, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -32.54,
   "hfov": 2.78,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_14_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.64
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.78,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_14_0.png",
      "class": "ImageResourceLevel",
      "width": 77,
      "height": 74
     }
    ]
   },
   "pitch": 5.64,
   "yaw": -32.54
  }
 ],
 "id": "overlay_A7B81D3C_BCCF_0F7C_41E7_4A4BBC85CD54",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7AD9D14_BCCF_0F0C_41B3_415A1094F90B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D71E9C_BF1F_4F80_41B9_56A495961C68, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -28.21,
   "hfov": 2.2,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_15_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.31
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.2,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_15_0.png",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 61
     }
    ]
   },
   "pitch": 4.31,
   "yaw": -28.21
  }
 ],
 "id": "overlay_A7A719E4_BCCD_170C_4191_4BEE3DB59DD1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A79B29BC_BCCD_177C_41DB_A4DAAFFEB606, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D62E9D_BF1F_4F80_41DA_685A529E76F8, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -24.63,
   "hfov": 1.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_16_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": 4.15
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_16_0.png",
      "class": "ImageResourceLevel",
      "width": 47,
      "height": 53
     }
    ]
   },
   "pitch": 4.15,
   "yaw": -24.63
  }
 ],
 "id": "overlay_A655A118_BCCD_3704_41E2_755CEEF492B1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A649D0EB_BCCD_3504_41D1_AED0AAF2B77D, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D52E9E_BF1F_4F80_41E3_7908B25B01A3, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -22.04,
   "hfov": 1.4,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_17_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 19
     }
    ]
   },
   "pitch": 3.24
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.4,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_17_0.png",
      "class": "ImageResourceLevel",
      "width": 39,
      "height": 47
     }
    ]
   },
   "pitch": 3.24,
   "yaw": -22.04
  }
 ],
 "id": "overlay_A64549D8_BCCD_1704_41E1_EEA9B1B528CE",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A63929AC_BCCD_171C_41D7_6988B9694168, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D42E9F_BF1F_4F80_41CF_367C112832D4, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -17.41,
   "hfov": 1.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_18_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 19
     }
    ]
   },
   "pitch": 1.64
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.41,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_18_0.png",
      "class": "ImageResourceLevel",
      "width": 39,
      "height": 47
     }
    ]
   },
   "pitch": 1.64,
   "yaw": -17.41
  }
 ],
 "id": "overlay_A65274DB_BCCD_1D04_41CA_03B6974DDA14",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A64664AB_BCCD_1D04_41D8_9EC7575AA640, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DB4EA0_BF1F_4F80_41C0_DD87F39C933D, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -13.79,
   "hfov": 1.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_19_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 19
     }
    ]
   },
   "pitch": 1.54
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.41,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_19_0.png",
      "class": "ImageResourceLevel",
      "width": 39,
      "height": 47
     }
    ]
   },
   "pitch": 1.54,
   "yaw": -13.79
  }
 ],
 "id": "overlay_A65BCA64_BCCB_1503_41E0_406758F520F2",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A657CA34_BCCB_1503_41BE_FB39DB0989DE, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DA6EA1_BF1F_4F80_41DF_02E10788074F, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 179.17,
   "hfov": 9.15,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_20_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 28
     }
    ]
   },
   "pitch": -6.77
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.15,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_20_0.png",
      "class": "ImageResourceLevel",
      "width": 255,
      "height": 461
     }
    ]
   },
   "pitch": -6.77,
   "yaw": 179.17
  }
 ],
 "id": "overlay_A2DFA5A9_BCCB_FF05_41E5_7BF03107D950",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3, this.camera_A7233AB0_BF1F_7780_41D8_DE40440493C7); this.mainPlayList.set('selectedIndex', 10)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01b"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -2.77,
   "hfov": 13.75,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_21_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 36,
      "height": 16
     }
    ]
   },
   "pitch": -23.32
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.75,
   "image": "this.AnimatedImageResource_9DA25E44_BD16_44B9_41CE_E63DDD19065D",
   "yaw": -2.77,
   "pitch": -23.32,
   "distance": 100
  }
 ],
 "id": "overlay_A7273DA4_BCD5_0F0C_41C2_30059EBEDE3E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4, this.camera_A716EAA0_BF1F_7780_41CD_54838C8E1244); this.mainPlayList.set('selectedIndex', 12)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -2.84,
   "hfov": 8.74,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_22_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -12.63
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.74,
   "image": "this.AnimatedImageResource_9DA27E45_BD16_44BB_41E4_368B67DD2787",
   "yaw": -2.84,
   "pitch": -12.63,
   "distance": 100
  }
 ],
 "id": "overlay_A3BCDC5D_BCD7_0D3C_41E4_06620DACB4D0",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC, this.camera_A72F0ABF_BF1F_7780_41D1_0A3013C7497E); this.mainPlayList.set('selectedIndex', 13)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 7.41,
 "bleachingDistance": 0.4,
 "pitch": 56.09,
 "bleaching": 0.7,
 "id": "overlay_8DCDA550_BC4D_1F04_41C5_8EC12977C931"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -14.19,
 "bleachingDistance": 0.4,
 "pitch": 46.04,
 "bleaching": 0.7,
 "id": "overlay_8DE5DB02_BC4D_0B07_41D1_E2EDAFEFB9D7"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -22.23,
 "bleachingDistance": 0.4,
 "pitch": 29.71,
 "bleaching": 0.7,
 "id": "overlay_8DE84E8D_BC4D_0D1C_41C2_A51D16CBD855"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -163.17,
 "bleachingDistance": 0.4,
 "pitch": 68.65,
 "bleaching": 0.7,
 "id": "overlay_8D9414D0_BC4D_7D04_41E3_00E9B3DAF742"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A8463918_BF1F_7280_41B5_026AB8A04BA1",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -179.87,
   "hfov": 12.58,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 36
     }
    ]
   },
   "pitch": -10.9
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.58,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 355,
      "height": 804
     }
    ]
   },
   "pitch": -10.9,
   "yaw": -179.87
  }
 ],
 "id": "overlay_B256E7B0_BC35_1B04_41D4_CEC74C297BEF",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084, this.camera_9EADB7DB_BF1F_7D87_41C7_0407632EE83D); this.mainPlayList.set('selectedIndex', 1)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A72F1ABF_BF1F_7780_41C4_D385D521BD34",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A89BA9E7_BF1F_7580_41E7_06EE7413F9CA",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A839F8F8_BF1F_7380_41DB_8C796F7095C3",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -125.21,
   "hfov": 2.85,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 17
     }
    ]
   },
   "pitch": 4.09
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.85,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 79,
      "height": 84
     }
    ]
   },
   "pitch": 4.09,
   "yaw": -125.21
  }
 ],
 "id": "overlay_A098DE12_BCD7_0D04_41E3_C060F710E828",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A0947DE4_BCD7_0F0C_41E4_EF183DE3D24C, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D9FEA2_BF1F_4F80_41BF_1ECEFCE3F88B, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -134.37,
   "hfov": 3.05,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.14
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.05,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 84,
      "height": 86
     }
    ]
   },
   "pitch": 4.14,
   "yaw": -134.37
  }
 ],
 "id": "overlay_A7347F00_BCD5_0B04_41A1_AFDEA2287FC4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7206ED5_BCD5_0D0C_41DB_6ACDD53EDB79, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9D8FEA3_BF1F_4F80_41B4_CEE2F82BEDAD, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -142.09,
   "hfov": 2.69,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.11
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.69,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 74,
      "height": 76
     }
    ]
   },
   "pitch": 4.11,
   "yaw": -142.09
  }
 ],
 "id": "overlay_A73D7E69_BCD5_0D04_419A_0BC7434A99F0",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7288E3D_BCD5_0D7C_41DC_C9763EC6B346, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DE0EA4_BF1F_4F80_41E2_C6ECA19DBA30, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -147.78,
   "hfov": 2.5,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.84
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.5,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 69,
      "height": 65
     }
    ]
   },
   "pitch": 3.84,
   "yaw": -147.78
  }
 ],
 "id": "overlay_A73122EC_BCD5_151C_41E3_9E6C70DCE9D5",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A72CF2BD_BCD5_157C_418D_12FD770BC899, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DEEEA5_BF1F_4F80_41BF_22A6C3F660EA, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -156.38,
   "hfov": 2.81,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 4.78
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.81,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 78,
      "height": 71
     }
    ]
   },
   "pitch": 4.78,
   "yaw": -156.38
  }
 ],
 "id": "overlay_A74C69D4_BCDB_370C_41E0_45E1F1756749",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A730B9A5_BCDB_370C_41D6_29D67E7AF9E2, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DE9EA6_BF1F_4F80_41CA_AA0C5B4A81A3, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -164.29,
   "hfov": 2.49,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 3.54
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.49,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 69,
      "height": 63
     }
    ]
   },
   "pitch": 3.54,
   "yaw": -164.29
  }
 ],
 "id": "overlay_A74C79D4_BCDB_370C_41A2_50B48E99884F",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A73139A6_BCDB_370C_41DB_C74F59D0C4FE, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DDAEA7_BF1F_4F80_41E4_DD9DF9E066A0, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -56.54,
   "hfov": 3.78,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 15
     }
    ]
   },
   "pitch": 9.32
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.78,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 106,
      "height": 103
     }
    ]
   },
   "pitch": 9.32,
   "yaw": -56.54
  }
 ],
 "id": "overlay_A73E2AD1_BCDA_F504_41C4_AFF8D24C5658",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A722AA9D_BCDA_F53C_41D6_31CC03BB1F64, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9DCAEA8_BF1F_4F80_41D8_38DF2209280B, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -44.7,
   "hfov": 2.7,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 7.02
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.7,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 75,
      "height": 78
     }
    ]
   },
   "pitch": 7.02,
   "yaw": -44.7
  }
 ],
 "id": "overlay_A73E3AD1_BCDA_F504_41DA_9ED971DABBEA",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7252A9E_BCDA_F53C_41E2_BC6D20063735, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E3BEA8_BF1F_4F80_41D6_76034B231539, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -35.78,
   "hfov": 2.29,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.7
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.29,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 64,
      "height": 63
     }
    ]
   },
   "pitch": 6.7,
   "yaw": -35.78
  }
 ],
 "id": "overlay_A73E4AD1_BCDA_F504_41B9_88EEBF597BC4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7255A9F_BCDA_F53C_41C6_3AB39A388ECE, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E2AEA9_BF1F_4F80_41E2_1756BFA258CA, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -29.76,
   "hfov": 2.06,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.91
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.06,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 57,
      "height": 57
     }
    ]
   },
   "pitch": 4.91,
   "yaw": -29.76
  }
 ],
 "id": "overlay_A73E5AD1_BCDA_F504_41C3_E88ABEA55F11",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A7257AA0_BCDA_F504_41B5_0019559949D5, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E1CEAA_BF1F_4F80_41D4_DA99B986162F, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -11.79,
   "hfov": 2.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_10_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.01
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.16,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_10_0.png",
      "class": "ImageResourceLevel",
      "width": 60,
      "height": 57
     }
    ]
   },
   "pitch": 2.01,
   "yaw": -11.79
  }
 ],
 "id": "overlay_A0949E84_BCDF_0D03_41E5_A20DC44FCD74",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A0998E55_BCDF_0D0D_41D7_63CEA2E3858A, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E0CEAB_BF1F_4F80_41DA_73621316361E, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -22.85,
   "hfov": 1.79,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_11_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 16
     }
    ]
   },
   "pitch": 2.55
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.79,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 49,
      "height": 50
     }
    ]
   },
   "pitch": 2.55,
   "yaw": -22.85
  }
 ],
 "id": "overlay_A0956E84_BCDF_0D03_41E0_DF941A2010B6",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A09E0E56_BCDF_0D0F_41C9_7DC30726E38A, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E61EAC_BF1F_4F80_41D5_51C471888BA3, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -17.26,
   "hfov": 1.87,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_12_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.58
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.87,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_12_0.png",
      "class": "ImageResourceLevel",
      "width": 51,
      "height": 53
     }
    ]
   },
   "pitch": 2.58,
   "yaw": -17.26
  }
 ],
 "id": "overlay_A0957E84_BCDF_0D03_41D1_593E5F1A5DBC",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A09EFE57_BCDF_0D0D_41E5_C11B8B2E2D62, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E51EAC_BF1F_4F80_41D1_F69242E69FA2, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 167.51,
   "hfov": 3.15,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_13_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.31
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.15,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_13_0.png",
      "class": "ImageResourceLevel",
      "width": 87,
      "height": 88
     }
    ]
   },
   "pitch": 5.31,
   "yaw": 167.51
  }
 ],
 "id": "overlay_A09E6037_BCDD_150C_41D0_AB5FDDDA6E6C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A0824FFC_BCDD_0AFC_41DA_43A159A46D98, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E41EAD_BF1F_4F80_41D2_117BD867FD31, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 150.89,
   "hfov": 3.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_14_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 6.24
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_14_0.png",
      "class": "ImageResourceLevel",
      "width": 86,
      "height": 84
     }
    ]
   },
   "pitch": 6.24,
   "yaw": 150.89
  }
 ],
 "id": "overlay_A09E5037_BCDD_150C_41D8_B60BDFFE4206",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A082CFFD_BCDD_0AFC_41C7_A2BEB6EA7AD8, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E4EEAE_BF1F_4F80_41DC_0BD5E7ED89DF, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 119.22,
   "hfov": 4.08,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_15_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.95
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.08,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_15_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 110
     }
    ]
   },
   "pitch": 4.95,
   "yaw": 119.22
  }
 ],
 "id": "overlay_A09E4037_BCDD_150C_41BA_5A3C94191FD6",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A082BFFE_BCDD_0AFC_41D6_28E4FEADBC4C, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E49EAF_BF1F_4F80_41E2_9997138E35D4, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 100.15,
   "hfov": 4.06,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_16_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 6.91
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.06,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_16_0.png",
      "class": "ImageResourceLevel",
      "width": 113,
      "height": 105
     }
    ]
   },
   "pitch": 6.91,
   "yaw": 100.15
  }
 ],
 "id": "overlay_A09E3037_BCDD_150C_41E3_B939EEEECCA6",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A0829FFF_BCDD_0AFC_41E4_0DA2859EB487, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9EBAEB0_BF1F_4F80_41D6_E45B7F6B5361, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 77.62,
   "hfov": 3.58,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_17_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.45
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.58,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_17_0.png",
      "class": "ImageResourceLevel",
      "width": 99,
      "height": 100
     }
    ]
   },
   "pitch": 4.45,
   "yaw": 77.62
  }
 ],
 "id": "overlay_A09E2037_BCDD_150C_41D5_4B8E065D107B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A0814000_BCDD_1504_41DE_578F53E9F700, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9EABEB1_BF1F_4F80_41DE_B6329F1E9B99, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 59.36,
   "hfov": 3.51,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_18_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 16
     }
    ]
   },
   "pitch": 7.06
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.51,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_18_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 103
     }
    ]
   },
   "pitch": 7.06,
   "yaw": 59.36
  }
 ],
 "id": "overlay_A09E1037_BCDD_150C_41DC_0D6FC7C8DA79",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A0812001_BCDD_1504_41E5_3BB22DA876C3, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E9AEB2_BF1F_4F80_41D9_308020633857, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 21.98,
   "hfov": 2.51,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_19_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 7.17
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.51,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_19_0.png",
      "class": "ImageResourceLevel",
      "width": 70,
      "height": 65
     }
    ]
   },
   "pitch": 7.17,
   "yaw": 21.98
  }
 ],
 "id": "overlay_A09CD209_BCDF_1505_41D1_B93869689260",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A08091DD_BCDF_173D_41DD_6E87ABA42077, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9E88EB3_BF1F_4F80_41AD_5A858EED408A, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01b"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -0.67,
   "hfov": 15.91,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_20_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 36,
      "height": 16
     }
    ]
   },
   "pitch": -20.24
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 15.91,
   "image": "this.AnimatedImageResource_9DA60E48_BD16_4549_41DD_DC672042029F",
   "yaw": -0.67,
   "pitch": -20.24,
   "distance": 100
  }
 ],
 "id": "overlay_9F8316F7_BCDB_1D0C_41B8_0F339BA5F57E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC, this.camera_A7D1DB9F_BF1F_7580_41D4_E81A9C6567C1); this.mainPlayList.set('selectedIndex', 13)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01b"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 179.91,
   "hfov": 14.77,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_21_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 36,
      "height": 16
     }
    ]
   },
   "pitch": -29.46
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 14.77,
   "image": "this.AnimatedImageResource_9DA62E48_BD16_4549_41E2_58CB7370222D",
   "yaw": 179.91,
   "pitch": -29.46,
   "distance": 100
  }
 ],
 "id": "overlay_9953D263_BCDB_F504_41C4_046762AD87F8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA, this.camera_A7CB7B90_BF1F_7580_41B5_A79C0516FE60); this.mainPlayList.set('selectedIndex', 11)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 179.98,
   "hfov": 5.66,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_22_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 27
     }
    ]
   },
   "pitch": -5.74
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.66,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_22_0.png",
      "class": "ImageResourceLevel",
      "width": 157,
      "height": 267
     }
    ]
   },
   "pitch": -5.74,
   "yaw": 179.98
  }
 ],
 "id": "overlay_A388B164_BCDB_170C_41C2_65E1443F9799",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3, this.camera_A7DDEBAE_BF1F_7580_41E4_85CA31AC1A00); this.mainPlayList.set('selectedIndex', 10)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -0.6,
   "hfov": 4.84,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_23_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 27
     }
    ]
   },
   "pitch": -2.72
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.84,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_23_0.png",
      "class": "ImageResourceLevel",
      "width": 134,
      "height": 233
     }
    ]
   },
   "pitch": -2.72,
   "yaw": -0.6
  }
 ],
 "id": "overlay_A30F6C5A_BCD5_0D04_41C9_E976A268694B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66, this.camera_A7BFAB81_BF1F_7580_41E3_2A73EB9DDA30); this.mainPlayList.set('selectedIndex', 14)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 85.29,
 "bleachingDistance": 0.4,
 "pitch": 64.12,
 "bleaching": 0.7,
 "id": "overlay_8C2F7E97_BC4B_0D0C_41D0_DDB422B15D13"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -132.77,
 "bleachingDistance": 0.4,
 "pitch": 59.6,
 "bleaching": 0.7,
 "id": "overlay_8DC577E8_BC4B_1B04_41C0_1A4A74994C98"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 10.43,
 "bleachingDistance": 0.26,
 "pitch": 25.44,
 "bleaching": 0.7,
 "id": "overlay_8DE9D602_BC4B_3D04_41DD_9F94665AF299"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7677B09_BF1F_7680_41DA_2D97FF2D1BD2",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7E86BBD_BF1F_7580_41E2_B8BC5A661834",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A8DD1A54_BF1F_7680_41E4_5E48441A9FA4",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A716FAA0_BF1F_7780_41BB_8643E7441A4C",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0,
   "hfov": 17.12,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 20
     }
    ]
   },
   "pitch": -9.93
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 17.12,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 482,
      "height": 609
     }
    ]
   },
   "pitch": -9.93,
   "yaw": 0
  }
 ],
 "id": "overlay_AC003143_BC3A_F704_41C5_6D898A1CE15B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B6F67366_B8D1_8237_41D4_A3DF68ABF4F4, this.camera_A863F96D_BF1F_7280_41D4_5FFB09E8C8FC); this.mainPlayList.set('selectedIndex', 0)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -93.06,
   "hfov": 11.26,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -22.2
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.26,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 337,
      "height": 349
     }
    ]
   },
   "pitch": -22.2,
   "yaw": -93.06
  }
 ],
 "id": "overlay_ADF1F9EE_BC3D_171C_41D7_E51D9E519EE9",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF, this.camera_A856794B_BF1F_7280_41DD_28B9A537BD00); this.mainPlayList.set('selectedIndex', 2)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -89.17,
   "hfov": 8.74,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -11.28
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.74,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 247,
      "height": 248
     }
    ]
   },
   "pitch": -11.28,
   "yaw": -89.17
  }
 ],
 "id": "overlay_B3E6F96F_BC3D_171C_41E4_AF424FAAE84A",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2, this.camera_A84A792B_BF1F_7280_41E4_A626253E568B); this.mainPlayList.set('selectedIndex', 3)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle Arrow 02 Left"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 163.13,
   "hfov": 10.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 1.41
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.8,
   "image": "this.AnimatedImageResource_9DB3AE35_BD16_44DB_41E1_AD5506A235C3",
   "yaw": 163.13,
   "pitch": 1.41,
   "distance": 50
  }
 ],
 "id": "overlay_9BBD60C7_BC3D_350C_41C0_97AE1670FEB4",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 14)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle Arrow 02 Right"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -162.78,
   "hfov": 10.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -0.32
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.8,
   "image": "this.AnimatedImageResource_9DB3CE35_BD16_44DB_41E7_974938228353",
   "yaw": -162.78,
   "pitch": -0.32,
   "distance": 50
  }
 ],
 "id": "overlay_9B1A0FA6_BC3D_0B0F_41CB_267C24857F5C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 13)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -22.74,
 "bleachingDistance": 0.4,
 "pitch": 42.27,
 "bleaching": 0.7,
 "id": "overlay_8DC1273A_BC75_3B04_41D6_49D8BAB54FE0"
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7BF8B82_BF1F_7580_41C3_443310983A67",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7D02B9F_BF1F_7580_4196_9036874A5E04",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 174.35,
   "hfov": 12.31,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 36
     }
    ]
   },
   "pitch": -16.18
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.31,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 355,
      "height": 804
     }
    ]
   },
   "pitch": -16.18,
   "yaw": 174.35
  }
 ],
 "id": "overlay_B362622E_BC3B_351C_41DF_93D86A6950FE",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084, this.camera_9E7EB7AD_BF1F_7D83_41DC_B4656ED234E5); this.mainPlayList.set('selectedIndex', 1)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 5.8,
   "hfov": 13.26,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": -23.73
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.26,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 402,
      "height": 462
     }
    ]
   },
   "pitch": -23.73,
   "yaw": 5.8
  }
 ],
 "id": "overlay_AD147811_BC3B_F504_41E1_31A7F28CE3C8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2, this.camera_9E58D78E_BF1F_7D81_41D3_9327C788BFEB); this.mainPlayList.set('selectedIndex', 3)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -0.2,
   "hfov": 8.82,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -4.23
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.82,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 245,
      "height": 245
     }
    ]
   },
   "pitch": -4.23,
   "yaw": -0.2
  }
 ],
 "id": "overlay_AE2A68CA_BC3D_3504_41C6_988DCF0D6336",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD, this.camera_9E9D27CA_BF1F_7D81_419F_E978FAA47B4A); this.mainPlayList.set('selectedIndex', 8)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1781E_B8EE_8E14_41D1_528375673140",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E1181E_B8EE_8E14_41E2_95D4129EF4F5",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A60CDBEB_BF1F_7580_41CB_4BABB70EBB1F",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A88929C7_BF1F_7580_41DA_A373CB25D7AE",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -124.63,
   "hfov": 2.96,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 8.66
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.96,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 83,
      "height": 84
     }
    ]
   },
   "pitch": 8.66,
   "yaw": -124.63
  }
 ],
 "id": "overlay_A2BED77D_BCD7_3BFC_41DD_D7E98F494A3B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2AAF744_BCD7_3B0C_41E5_8CAB0E334541, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9EE5EB4_BF1F_4F80_41E7_C8CC1A19CC28, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -109,
   "hfov": 3.13,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 8.94
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.13,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 87,
      "height": 86
     }
    ]
   },
   "pitch": 8.94,
   "yaw": -109
  }
 ],
 "id": "overlay_A2BEA77D_BCD7_3BFC_41E2_961A996D4473",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2AA8745_BCD7_3B0C_41CF_77DD8EB10AA6, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9ED9EB5_BF1F_4F80_41E0_C3EC1018604D, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -87.96,
   "hfov": 3.57,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 11.25
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.57,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 101,
      "height": 97
     }
    ]
   },
   "pitch": 11.25,
   "yaw": -87.96
  }
 ],
 "id": "overlay_A2BEB77D_BCD7_3BFC_41E6_A70A522E7EE9",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2AB7746_BCD7_3B0C_41C3_813B2F76F81B, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9EC7EB6_BF1F_4F80_41DC_EBA86CE60739, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -68.24,
   "hfov": 3.47,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 9.21
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.47,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 97,
      "height": 96
     }
    ]
   },
   "pitch": 9.21,
   "yaw": -68.24
  }
 ],
 "id": "overlay_A2BE877D_BCD7_3BFC_41DD_36DFF04160CD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2AB5747_BCD7_3B0C_41E0_0479B2C1EF85, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F37EB7_BF1F_4F80_41B4_6A5E453EB7F1, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -53.74,
   "hfov": 2.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 4.99
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 75,
      "height": 79
     }
    ]
   },
   "pitch": 4.99,
   "yaw": -53.74
  }
 ],
 "id": "overlay_A2BF677D_BCD7_3BFC_41B0_9CEA7AFE40FD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2ABC749_BCD7_3B04_41DA_2CC896E8AA4C, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F2AEB8_BF1F_4F80_41E2_038CF680E6B6, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -45.45,
   "hfov": 2.87,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_5_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.87
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.87,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_5_0.png",
      "class": "ImageResourceLevel",
      "width": 80,
      "height": 80
     }
    ]
   },
   "pitch": 5.87,
   "yaw": -45.45
  }
 ],
 "id": "overlay_A2BF777D_BCD7_3BFC_41A0_51DFE0C25D4C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2ABB74A_BCD7_3B04_41C3_5EF06D8BF07F, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F22EB9_BF1F_4F80_41CF_73F97A35E7BB, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -34.28,
   "hfov": 3.53,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_6_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 5.11
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.53,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_6_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 97
     }
    ]
   },
   "pitch": 5.11,
   "yaw": -34.28
  }
 ],
 "id": "overlay_A2BE977D_BCD7_3BFC_41C4_32CC60EDA226",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A2ABE748_BCD7_3B04_41E1_5DC9874E42B9, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F15EBA_BF1F_4F80_41DB_171F63F2AE4B, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 175.28,
   "hfov": 2.44,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_7_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.27
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.44,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_7_0.png",
      "class": "ImageResourceLevel",
      "width": 67,
      "height": 69
     }
    ]
   },
   "pitch": 3.27,
   "yaw": 175.28
  }
 ],
 "id": "overlay_A2966AF7_BCCB_750C_419A_BC9BB24AA4F1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A169FABD_BCCB_757C_41CA_5E4545E83CF7, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F07EBB_BF1F_4F80_41C3_B297A0F56BE3, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 165.85,
   "hfov": 2.12,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_8_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 17
     }
    ]
   },
   "pitch": 3.99
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.12,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_8_0.png",
      "class": "ImageResourceLevel",
      "width": 59,
      "height": 65
     }
    ]
   },
   "pitch": 3.99,
   "yaw": 165.85
  }
 ],
 "id": "overlay_A2967AF7_BCCB_750C_41DC_4C96F5C42FAD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A16A7ABE_BCCB_757C_41C7_05D7512279EC, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F74EBC_BF1F_4F80_419E_4CDD454BD837, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 156.32,
   "hfov": 2.65,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_9_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.31
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.65,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_9_0.png",
      "class": "ImageResourceLevel",
      "width": 73,
      "height": 76
     }
    ]
   },
   "pitch": 2.31,
   "yaw": 156.32
  }
 ],
 "id": "overlay_A2965AF7_BCCB_750C_41BB_04D317EBB16A",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A16A3ABF_BCCB_757C_41E2_0ECC1A1E6535, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F67EBD_BF1F_4F80_41D6_2AE3F85B53F7, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 150.97,
   "hfov": 3.27,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_10_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 17,
      "height": 16
     }
    ]
   },
   "pitch": 3.6
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.27,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_10_0.png",
      "class": "ImageResourceLevel",
      "width": 91,
      "height": 81
     }
    ]
   },
   "pitch": 3.6,
   "yaw": 150.97
  }
 ],
 "id": "overlay_A2966AF7_BCCB_750C_4169_D31EB984774C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A16ACAC0_BCCB_7504_41B4_B16602B7E77A, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F56EBE_BF1F_4F80_41D7_0D8C01EA8EEB, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 143.14,
   "hfov": 3.18,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_11_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.49
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.18,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_11_0.png",
      "class": "ImageResourceLevel",
      "width": 88,
      "height": 85
     }
    ]
   },
   "pitch": 2.49,
   "yaw": 143.14
  }
 ],
 "id": "overlay_A2967AF7_BCCB_750C_41E4_63427B254028",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A16AFAC1_BCCB_7504_41CA_D0FD2C583004, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F44EBF_BF1F_4F80_41E6_152BE9848710, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 133.12,
   "hfov": 3.52,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_12_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 16
     }
    ]
   },
   "pitch": 5.36
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.52,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_12_0.png",
      "class": "ImageResourceLevel",
      "width": 98,
      "height": 103
     }
    ]
   },
   "pitch": 5.36,
   "yaw": 133.12
  }
 ],
 "id": "overlay_A2960AF8_BCCB_7504_41D1_BB3D4F561451",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A16AAAC1_BCCB_7504_41E6_A274D14CD338, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9FB7EC0_BF1F_4F80_41E2_F2DD5B03C613, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 60.42,
   "hfov": 5.1,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_13_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 14.79
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.1,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_13_0.png",
      "class": "ImageResourceLevel",
      "width": 146,
      "height": 152
     }
    ]
   },
   "pitch": 14.79,
   "yaw": 60.42
  }
 ],
 "id": "overlay_A2961AF8_BCCB_7504_41D1_8D426BC373B8",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A16B5AC2_BCCB_7504_417C_23B58D4C4650, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9FA9EC1_BF1F_4F80_41E6_F9E985FFC9F3, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01b"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -177.34,
   "hfov": 17.48,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_14_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 36,
      "height": 16
     }
    ]
   },
   "pitch": -21.28
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 17.48,
   "image": "this.AnimatedImageResource_9DA9BE4C_BD16_4549_41E7_66BD64AFE88F",
   "yaw": -177.34,
   "pitch": -21.28,
   "distance": 100
  }
 ],
 "id": "overlay_9E19809E_BCCD_F53F_41E3_47249BED0F25",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4, this.camera_A876399A_BF1F_7580_41BD_7FFA2964AA39); this.mainPlayList.set('selectedIndex', 12)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -177.61,
   "hfov": 11.33,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_15_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -11.11
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 11.33,
   "image": "this.AnimatedImageResource_9DA9DE4C_BD16_4549_41B8_4D6DA38D1054",
   "yaw": -177.61,
   "pitch": -11.11,
   "distance": 100
  }
 ],
 "id": "overlay_99550AE4_BCCD_750C_41D9_BBC3DB345A56",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA, this.camera_A86E898B_BF1F_7580_41B7_C7154CA11ACA); this.mainPlayList.set('selectedIndex', 11)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -177.6,
   "hfov": 4.16,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_16_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 26
     }
    ]
   },
   "pitch": -2.94
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.16,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_16_0.png",
      "class": "ImageResourceLevel",
      "width": 115,
      "height": 187
     }
    ]
   },
   "pitch": -2.94,
   "yaw": -177.6
  }
 ],
 "id": "overlay_97E0FD35_BCCF_0F0C_41D2_AFB7B8D5CA87",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3, this.camera_A87869A8_BF1F_7580_41E1_2F70CF66940B); this.mainPlayList.set('selectedIndex', 10)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -152.24,
   "hfov": 1.77,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_17_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 15,
      "height": 15
     }
    ]
   },
   "pitch": 2.59
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.77,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_17_0.png",
      "class": "ImageResourceLevel",
      "width": 49,
      "height": 49
     }
    ]
   },
   "pitch": 2.59,
   "yaw": -152.24
  }
 ],
 "id": "overlay_A3F40EA6_BCCD_0D0C_41E2_9509E9637277",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A3C85E6D_BCCD_0D1C_41D1_1E2D144F1B99, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F80EC3_BF1F_4F80_41B7_AA0CE87A3190, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -154.78,
   "hfov": 1.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_18_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.38
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_18_0.png",
      "class": "ImageResourceLevel",
      "width": 47,
      "height": 47
     }
    ]
   },
   "pitch": 2.38,
   "yaw": -154.78
  }
 ],
 "id": "overlay_A3F43EA6_BCCD_0D0C_41D7_A016B7FF3477",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A3C8DE6E_BCCD_0D1C_41D2_95B3D3933BA6, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9FF0EC4_BF1F_4F80_41AB_BFD0D7AD960D, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -157.15,
   "hfov": 1.72,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_19_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.62
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.72,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_19_0.png",
      "class": "ImageResourceLevel",
      "width": 47,
      "height": 49
     }
    ]
   },
   "pitch": 2.62,
   "yaw": -157.15
  }
 ],
 "id": "overlay_A3F42EA6_BCCD_0D0C_41BC_2D3468E7FF90",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A3C8EE6F_BCCD_0D1C_41E4_6978D0A6DBFF, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9F8EEC5_BF1F_4F80_41D8_D47F1462205E, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -159.32,
   "hfov": 1.71,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_20_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.46
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.71,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_20_0.png",
      "class": "ImageResourceLevel",
      "width": 47,
      "height": 47
     }
    ]
   },
   "pitch": 2.46,
   "yaw": -159.32
  }
 ],
 "id": "overlay_A3F4DEA6_BCCD_0D0C_41E2_F74818B94961",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A3C88E70_BCCD_0D04_41DE_837C92032C3E, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9FE1EC6_BF1F_4F80_41E4_FB5117E02AAE, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -163.18,
   "hfov": 1.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_21_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 3.15
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.8,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_21_0.png",
      "class": "ImageResourceLevel",
      "width": 50,
      "height": 50
     }
    ]
   },
   "pitch": 3.15,
   "yaw": -163.18
  }
 ],
 "id": "overlay_A3F4CEA6_BCCD_0D0C_41E2_E7C7CAB701FC",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A3CF4E71_BCCD_0D04_41D6_ECA7B4EF4D09, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9FEFEC6_BF1F_4F80_41D0_CADCE2B562C2, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -167.87,
   "hfov": 1.8,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_22_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 2.26
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 1.8,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_22_0.png",
      "class": "ImageResourceLevel",
      "width": 50,
      "height": 50
     }
    ]
   },
   "pitch": 2.26,
   "yaw": -167.87
  }
 ],
 "id": "overlay_A3F4FEA6_BCCD_0D0C_41D2_A6657F36DB6F",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_A3CF6E72_BCCD_0D04_41D0_0A4ABE90D3D4, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9FDEEC7_BF1F_4F80_41E2_3C33B329026C, null, null, null, null, false)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 2.4,
   "hfov": 7.52,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_23_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 31
     }
    ]
   },
   "pitch": -3.84
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 7.52,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_23_0.png",
      "class": "ImageResourceLevel",
      "width": 209,
      "height": 406
     }
    ]
   },
   "pitch": -3.84,
   "yaw": 2.4
  }
 ],
 "id": "overlay_9981998F_BCCA_F71C_41DF_89CC8DE0BF57",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66, this.camera_A880A9B7_BF1F_7580_41C9_44486825D046); this.mainPlayList.set('selectedIndex', 14)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 121.72,
 "bleachingDistance": 0.4,
 "pitch": 64.12,
 "bleaching": 0.7,
 "id": "overlay_8DD4AB06_BC4B_0B0C_41DA_18073B5EB6E8"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 156.89,
 "bleachingDistance": 0.4,
 "pitch": 72.16,
 "bleaching": 0.7,
 "id": "overlay_8DC8F322_BC4B_1B04_41CE_5FB99DE844E8"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -135.03,
 "bleachingDistance": 0.4,
 "pitch": 64.12,
 "bleaching": 0.7,
 "id": "overlay_8DFFD92A_BC4B_1704_41D0_EAA8052408E8"
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 14.99,
   "hfov": 10.34,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 17
     }
    ]
   },
   "pitch": -6.39
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 10.34,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 289,
      "height": 311
     }
    ]
   },
   "pitch": -6.39,
   "yaw": 14.99
  }
 ],
 "id": "overlay_A9E88B08_BC3D_0B04_41D2_CD5B8D303355",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD, this.camera_A76D9B19_BF1F_7680_41BD_6C1489F91983); this.mainPlayList.set('selectedIndex', 8)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 83.72,
   "hfov": 12.14,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 19
     }
    ]
   },
   "pitch": -9.92
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.14,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 342,
      "height": 407
     }
    ]
   },
   "pitch": -9.92,
   "yaw": 83.72
  }
 ],
 "id": "overlay_AFC1C37B_BC3B_1B04_41AD_132794EB064B",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23, this.camera_A7A46B64_BF1F_7680_41E4_48628DCB8CFE); this.mainPlayList.set('selectedIndex', 4)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -160.08,
   "hfov": 13.08,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": -25.43
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 13.08,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 402,
      "height": 462
     }
    ]
   },
   "pitch": -25.43,
   "yaw": -160.08
  }
 ],
 "id": "overlay_A8B60D08_BC3B_0F04_41AF_FAA67409D144",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE57AF_B8D2_8235_41E3_C523F9CBD3AF, this.camera_A779CB29_BF1F_7680_41B3_3BF5CEF707DC); this.mainPlayList.set('selectedIndex', 2)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -160.74,
   "hfov": 9.29,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": -10.87
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.29,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 262,
      "height": 306
     }
    ]
   },
   "pitch": -10.87,
   "yaw": -160.74
  }
 ],
 "id": "overlay_A8DDDE48_BC3B_0D04_41DC_F34535948562",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084, this.camera_A7936B48_BF1F_7680_41D2_7D9E5F427FCD); this.mainPlayList.set('selectedIndex', 1)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 0.51,
   "hfov": 4.09,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": 10.78
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 4.09,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 115,
      "height": 110
     }
    ]
   },
   "pitch": 10.78,
   "yaw": 0.51
  }
 ],
 "id": "overlay_8D184A0C_BC77_F503_41E7_1EEB9E4DC750",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_8D1EBF8A_BC77_0B04_41BC_7E8313EFCBDE, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A4012C4C_BD0A_C549_41E1_9CBAF83AC1F0, null, null, null, null, false)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5FD681D_B8EE_8E14_41DC_A7ADD9842E22",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -115.89,
   "hfov": 9.82,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 18
     }
    ]
   },
   "pitch": -9.87
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 9.82,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_0_0.png",
      "class": "ImageResourceLevel",
      "width": 276,
      "height": 316
     }
    ]
   },
   "pitch": -9.87,
   "yaw": -115.89
  }
 ],
 "id": "overlay_AF992BA1_BC37_0B04_41C1_9E5838506A66",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5A72E38_B8D2_821C_41E4_DCCF82BA74F2, this.camera_A8A97A0A_BF1F_7680_41CE_879E8B6EFFE0); this.mainPlayList.set('selectedIndex', 3)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -0.44,
   "hfov": 12.42,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 16
     }
    ]
   },
   "pitch": -11.53
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 12.42,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_1_0.png",
      "class": "ImageResourceLevel",
      "width": 352,
      "height": 345
     }
    ]
   },
   "pitch": -11.53,
   "yaw": -0.44
  }
 ],
 "id": "overlay_AFE5F6BA_BC37_7D04_41E0_B69BF31957A1",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5B85AE2_B8D3_822C_41E6_C78B94EEE5F0, this.camera_A8CBDA36_BF1F_7680_41D6_2A7DA9E2BEE4); this.mainPlayList.set('selectedIndex', 5)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -9.43,
   "hfov": 5.49,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 50
     }
    ]
   },
   "pitch": -3.11
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 5.49,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_2_0.png",
      "class": "ImageResourceLevel",
      "width": 152,
      "height": 475
     }
    ]
   },
   "pitch": -3.11,
   "yaw": -9.43
  }
 ],
 "id": "overlay_A97516D9_BC4F_1D04_41E4_FACD4C37D39A",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FE60E7_B8D3_9E34_41D8_ECF42AA0E873, this.camera_A8BC4A26_BF1F_7680_41D0_B02A6CA8F6E5); this.mainPlayList.set('selectedIndex', 6)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 72.74,
   "hfov": 3.03,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 17
     }
    ]
   },
   "pitch": 1.12
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.03,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FFFBF4_B8D3_8214_41E0_75D167B81B23_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 84,
      "height": 90
     }
    ]
   },
   "pitch": 1.12,
   "yaw": 72.74
  }
 ],
 "id": "overlay_8D000C61_BC75_0D05_41D4_DEAB7D8DA7AD",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.showPopupPanoramaOverlay(this.popup_8D06CC75_BC77_0D0C_41E3_A4DC2E0BC51C, {'rollOverIconHeight':20,'pressedBackgroundOpacity':0.3,'paddingBottom':5,'rollOverIconWidth':20,'pressedIconHeight':20,'backgroundColorRatios':[0,0.09803921568627451,1],'rollOverIconLineWidth':5,'pressedBorderColor':'#000000','pressedBackgroundColorDirection':'vertical','backgroundColorDirection':'vertical','iconColor':'#000000','pressedIconLineWidth':5,'pressedBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'iconHeight':20,'rollOverBorderColor':'#000000','pressedIconColor':'#888888','borderSize':0,'iconLineWidth':5,'rollOverIconColor':'#666666','rollOverBackgroundOpacity':0.3,'rollOverBackgroundColorDirection':'vertical','pressedBackgroundColorRatios':[0,0.09803921568627451,1],'rollOverBackgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'rollOverBackgroundColorRatios':[0,0.09803921568627451,1],'paddingTop':5,'iconWidth':20,'paddingLeft':5,'borderColor':'#000000','paddingRight':5,'rollOverBorderSize':0,'pressedBorderSize':0,'backgroundColor':['#DDDDDD','#EEEEEE','#FFFFFF'],'backgroundOpacity':0.3,'pressedIconWidth':20}, this.ImageResource_A9A2FE6B_BF1F_4E80_41C8_2E73D105D2F9, null, null, null, null, false)"
  }
 ]
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_B5E0181D_B8EE_8E14_41B6_5E4FB3FE0567",
 "restartMovementOnUserInteraction": false
},
{
 "class": "PanoramaCameraSequence",
 "movements": [
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_in",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "linear",
   "yawSpeed": 7.96,
   "yawDelta": 323
  },
  {
   "class": "DistancePanoramaCameraMovement",
   "easing": "cubic_out",
   "yawSpeed": 7.96,
   "yawDelta": 18.5
  }
 ],
 "id": "sequence_A7230AB0_BF1F_7780_41E0_754621EDC7D9",
 "restartMovementOnUserInteraction": false
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 179.27,
   "hfov": 8.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_0_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -10.02
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 8.41,
   "image": "this.AnimatedImageResource_9DAC9E4E_BD16_4549_41E6_97991BB9C9BE",
   "yaw": 179.27,
   "pitch": -10.02,
   "distance": 100
  }
 ],
 "id": "overlay_9DA9988B_BCF5_3504_41E4_C908A798459C",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B582C310_B8D1_83EC_41DD_839A838F01EC, this.camera_9E48377E_BF1F_7D7E_41E4_318E756FA2A2); this.mainPlayList.set('selectedIndex', 13)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 178.89,
   "hfov": 6.5,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_1_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -7.25
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.5,
   "image": "this.AnimatedImageResource_9DACBE4E_BD16_4549_419E_C31D0366FAAB",
   "yaw": 178.89,
   "pitch": -7.25,
   "distance": 100
  }
 ],
 "id": "overlay_9D244A39_BCF5_F504_41B0_4B48FCBE2EAA",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4, this.camera_9E396770_BF1F_7E81_41DA_0868D73461E1); this.mainPlayList.set('selectedIndex', 12)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Circle 01c"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 178.65,
   "hfov": 3.98,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_2_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 61,
      "height": 16
     }
    ]
   },
   "pitch": -5.35
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 3.98,
   "image": "this.AnimatedImageResource_9DACDE4E_BD16_4549_41BF_B79966417AD9",
   "yaw": 178.65,
   "pitch": -5.35,
   "distance": 100
  }
 ],
 "id": "overlay_9E7EA252_BCF5_7504_41B4_7A439A69DC9D",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 11)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": 178.42,
   "hfov": 2.5,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_3_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 31
     }
    ]
   },
   "pitch": -1.72
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 2.5,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_3_0.png",
      "class": "ImageResourceLevel",
      "width": 69,
      "height": 135
     }
    ]
   },
   "pitch": -1.72,
   "yaw": 178.42
  }
 ],
 "id": "overlay_9E676EDC_BCF7_0D3C_41E3_2E4F9C7A4A7E",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.mainPlayList.set('selectedIndex', 10)"
  }
 ]
},
{
 "class": "HotspotPanoramaOverlay",
 "rollOverDisplay": false,
 "data": {
  "label": "Image"
 },
 "useHandCursor": true,
 "maps": [
  {
   "class": "HotspotPanoramaOverlayMap",
   "yaw": -1.85,
   "hfov": 6.41,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_4_0_0_map.gif",
      "class": "ImageResourceLevel",
      "width": 16,
      "height": 30
     }
    ]
   },
   "pitch": -6.52
  }
 ],
 "items": [
  {
   "class": "HotspotPanoramaOverlayImage",
   "hfov": 6.41,
   "distance": 50,
   "image": {
    "class": "ImageResource",
    "levels": [
     {
      "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_4_0.png",
      "class": "ImageResourceLevel",
      "width": 179,
      "height": 341
     }
    ]
   },
   "pitch": -6.52,
   "yaw": -1.85
  }
 ],
 "id": "overlay_9FBFB35C_BCF7_1B3C_41D0_52DD4DB7AE73",
 "enabledInCardboard": true,
 "areas": [
  {
   "class": "HotspotPanoramaOverlayArea",
   "mapColor": "#FF0000",
   "click": "this.startPanoramaWithCamera(this.panorama_B591806C_B8EE_FE34_41B0_045D2E0FABBF, this.camera_9E29E761_BF1F_7E83_41B1_9E1932EB4756); this.mainPlayList.set('selectedIndex', 15)"
  }
 ]
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 102.62,
 "bleachingDistance": 0.4,
 "pitch": 69.4,
 "bleaching": 0.7,
 "id": "overlay_8C2D6A98_BC4B_3504_41C6_985AB15AD2FE"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -117.19,
 "bleachingDistance": 0.4,
 "pitch": 73.42,
 "bleaching": 0.7,
 "id": "overlay_8DD9E2AE_BC4B_151C_41E5_D7A341E28393"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -87.8,
 "bleachingDistance": 0.4,
 "pitch": 61.11,
 "bleaching": 0.7,
 "id": "overlay_8DC61686_BC4B_1D0C_41E2_77B14F6C530D"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -79.26,
 "bleachingDistance": 0.4,
 "pitch": 50.31,
 "bleaching": 0.7,
 "id": "overlay_8DC39958_BC4B_1703_4172_053CBA0DFEA5"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": -45.85,
 "bleachingDistance": 0.4,
 "pitch": 40.76,
 "bleaching": 0.7,
 "id": "overlay_8DCBAEA1_BC4B_0D05_41CD_878A24C4978C"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 56.4,
 "bleachingDistance": 0.4,
 "pitch": 53.07,
 "bleaching": 0.7,
 "id": "overlay_8DF8B507_BC4A_FF0C_41E1_C90F40DB1012"
},
{
 "class": "LensFlarePanoramaOverlay",
 "yaw": 66.45,
 "bleachingDistance": 0.4,
 "pitch": 62.11,
 "bleaching": 0.7,
 "id": "overlay_8DE6D91F_BC4A_F73C_41E6_758844E20E74"
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DBBDE3D_BD16_44CB_41D1_1152FB8FA7BB",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DBBFE3D_BD16_44CB_41DF_5315A38276AC",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FE9AD1_B8D2_826C_41E1_958861DBD7CD_1_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DBC1E3D_BD16_44CB_41E2_CB24AD6D749D",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_7_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DBF5E41_BD16_44BB_41DF_A04F7860B566",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_8_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DBF7E41_BD16_44BB_41D2_9BC44BE521E0",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FD24B0_B8D1_862C_41E3_E2117672A7B3_1_HS_9_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DBFAE41_BD16_44BB_41E1_1CD82E32EF4D",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_21_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 600
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DA25E44_BD16_44B9_41CE_E63DDD19065D",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B581F97B_B8D1_8E1C_41D2_CFE8F957D0BA_1_HS_22_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DA27E45_BD16_44BB_41E4_368B67DD2787",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_20_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 600
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DA60E48_BD16_4549_41DD_DC672042029F",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FD1DF3_B8D1_862C_419A_E6CC45CCD2F4_1_HS_21_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 600
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DA62E48_BD16_4549_41E2_58CB7370222D",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_3_0.png",
   "class": "ImageResourceLevel",
   "width": 800,
   "height": 1200
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_9DB3AE35_BD16_44DB_41E1_AD5506A235C3",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5B7F8F5_B8D1_8E14_41CD_104F3A790084_1_HS_4_0.png",
   "class": "ImageResourceLevel",
   "width": 800,
   "height": 1200
  }
 ],
 "frameCount": 24,
 "rowCount": 6,
 "id": "AnimatedImageResource_9DB3CE35_BD16_44DB_41E7_974938228353",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_14_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 600
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DA9BE4C_BD16_4549_41E7_66BD64AFE88F",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B582C310_B8D1_83EC_41DD_839A838F01EC_1_HS_15_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DA9DE4C_BD16_4549_41B8_4D6DA38D1054",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_0_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DAC9E4E_BD16_4549_41E6_97991BB9C9BE",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_1_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DACBE4E_BD16_4549_419E_C31D0366FAAB",
 "frameDuration": 41
},
{
 "class": "AnimatedImageResource",
 "colCount": 4,
 "levels": [
  {
   "url": "media/panorama_B5FDF894_B8EE_8EEB_41B5_221ABA80EE66_1_HS_2_0.png",
   "class": "ImageResourceLevel",
   "width": 1080,
   "height": 350
  }
 ],
 "frameCount": 20,
 "rowCount": 5,
 "id": "AnimatedImageResource_9DACDE4E_BD16_4549_41BF_B79966417AD9",
 "frameDuration": 41
}],
 "scrollBarVisible": "rollOver",
 "height": "100%",
 "propagateClick": true,
 "verticalAlign": "top",
 "backgroundPreloadEnabled": true,
 "overflow": "hidden",
 "defaultVRPointer": "laser",
 "shadow": false,
 "scrollBarMargin": 2,
 "paddingTop": 0,
 "mobileMipmappingEnabled": false,
 "data": {
  "name": "Player468"
 }
};


	function HistoryData(playList) {
		this.playList = playList;
		this.list = [];
		this.pointer = -1;
	}

	HistoryData.prototype.add = function(index){
		if(this.pointer < this.list.length && this.list[this.pointer] == index) {
			return;
		}
		++this.pointer;
		this.list.splice(this.pointer, this.list.length - this.pointer, index);
	};

	HistoryData.prototype.back = function(){
		if(!this.canBack()) return;
		this.playList.set('selectedIndex', this.list[--this.pointer]);
	};

	HistoryData.prototype.forward = function(){
		if(!this.canForward()) return;
		this.playList.set('selectedIndex', this.list[++this.pointer]);
	};

	HistoryData.prototype.canBack = function(){
		return this.pointer > 0;
	};

	HistoryData.prototype.canForward = function(){
		return this.pointer >= 0 && this.pointer < this.list.length-1;
	};


	if(script.data == undefined)
		script.data = {};
	script.data["history"] = {};   

	TDV.PlayerAPI.defineScript(script);
})();
