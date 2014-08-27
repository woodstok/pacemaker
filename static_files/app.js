

  // playlistExample.doPlaylistForAlbum();

   

    var playlist_songs = null;

    var g_playlist_params = '';
// $.ajax({type:"GET", dataType: "json", xhrFields: {
//             withCredentials: true
//         }, url: "http://developer.echonest.com/user/api_key.json"}).then(
//             function(data){
//                 api_key = data.api_key;
//                 });


    var templates = {};
    $.ajaxSetup({traditional: true, cache: true});

    var api_key = 'xxxx';
    var host = 'http://developer.echonest.com';
    var standard_args = {api_key:api_key, format:'jsonp'};
    var playlist_standard_args = {bucket: ['id:spotify','tracks', 'artist_hotttnesss', 'song_hotttnesss', 'audio_summary'], limit: true};
    var echonest_logo = '/static/img/echonest_logo.jpg';
    var mySoundManager = null;

    function en_call(section, verb, args, callback){
        var url = host+'/api/v4/'+section+'/'+verb;
        $.get(url, _.extend({}, args, standard_args), function(data) {
            callback(data);
        }, 'jsonp');
    }

    function add_playlist_constraint(ev){
        ev.preventDefault();
        $(this).trigger('new-constraint');
        var $this = $(this), id = $this.attr('id');
        
        // you can only add songs OR artists, not both

        if (id === 'artist' || id === 'song') {
            if ( $('.constraint[data-type="'+id+'"]').size() >= 4 ) {
                $this.addClass('disabled');
            }
        }
        if(id == 'artist'){
            $('#song').addClass('disabled');
        }else if(id == 'song'){
            $('#artist').addClass('disabled');
        }else{
            $this.addClass('disabled');
        }

        var hint_text = get_hint_text(id);
        
        var slider_settings = {
            variety: {min:0.1, max:1.0, defalt:0.5, step:0.05},
            results: {min:5, max:50, defalt:15, step:1},
            duration: {min:0, max:3600, step:30},
            danceability: {min:0, max:1.0, step:0.05},
            energy: {min:0, max:1.0, step:0.05},
            artist_hotttnesss: {min:0, max:1.0, step:0.05},
            song_hotttnesss: {min:0, max:1.0, step:0.05},
            tempo: {min:60, max:240, step:10}
        };

        if (id == 'artist' || id == 'song' || id == 'distribution') {
            var inner = templates['add_'+id]();
        } else if (id == 'variety' || id == 'results') {
            var inner = templates.add_single_slider(_.extend({type:id},slider_settings[id]));
        } else {
            var inner = templates.add_double_slider(_.extend({type:id},slider_settings[id]));
        }

        var content = $(templates.constraint_wrapper({
            wrapped_html:inner, type:id, title:$this.text(), hint:hint_text
        }));
        $('#constraints').append(content);
       
        content.find('.hint').each(function(){$(this).popover();});
        
        content.find('.single-slider').each(function(){
            var slider_div = $(this);
            $('#show_val_'+id).html(slider_div.data('default_val'));
            slider_div.slider({
                max: slider_div.data('max'),
                min: slider_div.data('min'),
                step: slider_div.data('step'),
                value: slider_div.data('default_val'),
                animate: true,
                range: 'min',
                slide: function(ev, ui) {
                    $('#show_val_'+id).html(ui.value);
                }
            });
        });

        content.find('.double-slider').each(function(){
            var slider_div = $(this);
            if ( id === 'duration' ) {
                $('#show_min_'+id).html(get_minutes_display(slider_div.data('min')));
                $('#show_max_'+id).html(get_minutes_display(slider_div.data('max')));
            } else {
                $('#show_min_'+id).html(slider_div.data('min'));
                $('#show_max_'+id).html(slider_div.data('max'));
            }
            slider_div.slider({
                max: slider_div.data('max'),
                min: slider_div.data('min'),
                step: slider_div.data('step'),
                values: [slider_div.data('min'), slider_div.data('max')],
                animate: true,
                range: true,
                slide: function(ev, ui) {
                    if ( id === 'duration' ) {
                        $('#show_min_'+id).html(get_minutes_display(ui.values[0]));
                        $('#show_max_'+id).html(get_minutes_display(ui.values[1]));
                    } else {
                        $('#show_min_'+id).html(ui.values[0]);
                        $('#show_max_'+id).html(ui.values[1]);
                    }
                }
           });
           
           function get_minutes_display(seconds) {
                var minutes = Math.floor(seconds/60);
                minutes = (minutes === 0) ? '0' : minutes;
                var seconds = seconds % 60;
                seconds = (seconds<10) ? '0'+seconds : seconds;
                var display = minutes+':'+seconds;        
                return display;
           }   
        });

        content.find('.add-song-control-group').each(function() {
            var $c = $(this);
            var $song_input = $c.find('.song-search').first();
            var $artist_input = $c.find('.artist-search').first();
            $song_input.on('data-entry-clear data-entry-pending data-entry-success data-entry-failure', update_song_constraint);
            monitor_text_entry($artist_input, $song_input);
        });
        
        content.find('.artist-only-search').each(function() {
            $(this).on('data-entry-clear data-entry-pending data-entry-success data-entry-failure', update_artist_constraint);
            monitor_text_entry($(this)); 
        });
    }

    function monitor_text_entry($e1, $e2) {
        var words_re = '.*\\w.*';
        if ($e2 === undefined) {
            $e1.blur(function() {
                var ev = on_blur($e1);
                if (ev) {
                    $e1.trigger(ev);
                }
            });
            $e1.keyup(function(ev) {
                var ev = on_keyup(ev, $e1);
                if (ev) {
                    $e1.trigger(ev);
                }
            });
        } else {
            _.each([$e1, $e2], function($e) {
                $e.blur(function() {
                    var ev = on_blur($e);
                    pair_helper(ev);
                });
                $e.keyup(function(ev) {
                    var ev = on_keyup(ev, $e);
                    pair_helper(ev);
                });
            });
        }

        function pair_helper(ev) {
            var content = $e1.val().match(words_re) && $e2.val().match(words_re);
            if ( ev === 'data-entry-pending' && content ) {
                $e2.trigger(ev);
            } else if ( ev === 'data-entry-clear' ) {
                $e2.trigger(ev);
            }
        }
        function on_blur($e) {
            return check_content($e) || check_empty($e);
        }
        function on_keyup(ev, $e) {
            if (ev.which === 13) {
                var ev = check_content($e);
                if (ev) {
                    return ev;
                }
            }
            return check_empty($e);
        }
        function check_empty($e) {
            if ( !$e.val().match(words_re) && $e.data('prev_val') !== '' ) {
                $e.data('prev_val', '');
                return 'data-entry-clear';
            }
        }
        function check_content($e) {
            if ( $e.val().match(words_re) ) {
                $e.val( $e.val().trim() );
                if ($e.data('prev_val') !== $e.val()) {
                    $e.data('prev_val', $e.val());
                    return 'data-entry-pending';
                }
            }           
        }

    }

    function update_song_constraint(ev, info) {
        var song_input = this,
            $song_input = $(song_input),
            $control_group = $('.add-song-control-group'),
            $artist_input = $control_group.find('input.artist-search'),
            $data_status = $control_group.find('.data-status'),
            $data_status_spinner = $control_group.find('.spinner'),
            $constraint_container = $control_group.parents('.constraint-container');
        switch (ev.type) {
            case 'data-entry-pending':
                $control_group.find('.status-msg').removeClass('hide');
                $data_status_spinner.css({
                    'display':'inline-block',
                    'float':'left',
                });
                $data_status.html('<span class="gray"> ' + 
                    'Searching for \"' +
                    $song_input.val() + '\" by ' + 
                    $artist_input.val() + '... </span>');
                $data_status.data("status", "pending"); 
                search_for_song_id(song_input);
                break;
            case 'data-entry-success':
                $control_group.find('.status-msg').addClass('hide');
                $constraint_container.html(templates.added_song({song: info.song, track: info.track}));
                $constraint_container.addClass('data-status');
                $constraint_container.data('status', 'success');
                $constraint_container.data('song_id', info.song.id);
                $constraint_container.data('artist_name', info.artist_name);
                break;
            case 'data-entry-failure':
                $control_group.find('.status-msg').removeClass('hide');
                $data_status_spinner.css("display", "none");
                $data_status.html('<span class="red"> ' + 
                    '<b>!</b> &nbsp Could not find \"' + 
                    $song_input.val() + '\" by ' +
                    $artist_input.val() + '.</span>');
                $data_status.data("status", "failure");
                $control_group.addClass("error");
                break;
            case 'data-entry-clear':
                $control_group.find('.status-msg').addClass('hide');
                $data_status_spinner.css("display", "none");
                $data_status.empty();
                $data_status.data("status", "");
                $song_input.data("id", "");
                $control_group.removeClass("error success");
                break;
            default:
        }
    }

    function update_artist_constraint(ev, info) {
        var artist_input = this,
            $artist_input = $(artist_input),
            $control_group = $artist_input.parents('.control-group'),
            $data_status = $control_group.find('.data-status'),
            $data_status_spinner = $control_group.find('.spinner');
            $constraint_container = $control_group.parents('.constraint-container');
        switch (ev.type) {
            case 'data-entry-pending':
                $control_group.find('.status-msg').removeClass('hide');
                $data_status_spinner.css('display', 'block');
                $data_status.html('<span class="gray"> ' + 
                    'Searching for ' + $artist_input.val() + '... </span>');
                $data_status.data("status", "pending");
                search_for_artist_id(artist_input);
                break;
            case 'data-entry-success':
                $control_group.find('.status-msg').addClass('hide');
                $constraint_container.html(templates.added_artist({artist_name: info.artist_name}));
                $constraint_container.addClass('data-status');
                $constraint_container.data('status', 'success');
                $constraint_container.data('artist_id', info.artist_id);
                $constraint_container.data('artist_name', info.artist_name);
                break;
            case 'data-entry-failure':
                $control_group.find('.status-msg').removeClass('hide');
                $data_status_spinner.css("display", "none");
                $data_status.html('<span class="red"> ' +
                    '<b>!</b> &nbsp Could not find '+
                    $artist_input.val()+'.</span>');
                $data_status.data("status", "failure");
                $control_group.removeClass("success");
                $control_group.addClass("error");
                break;    
            case 'data-entry-clear':
                $control_group.find('.status-msg').addClass('hide');
                $data_status_spinner.css("display", "none");
                $data_status.empty();
                $data_status.data("status", "");
                $artist_input.data("id", "");
                $control_group.removeClass("error success");
                break;
            default:
        } 
    }

    function get_hint_text(constraint_type) {
        switch (constraint_type) {
            case 'variety':
               return {title: "Variety", content: "Controls the number of different artists that will be in the playlist.  For a 100-song playlist, a variety of 0.3 is roughly 30 artists, 0.5 is roughly 50, and so on.  Ranges from 0.1 to 1.0."};
               break;
            case 'distribution':
                return {title: "Distribution", content: "Determines whether the playlist should be focused on the seed artist (more songs from the seed and closer relevant artists and fewer from more distant artists), or wander, treating more relevant and less relevant artists the same way."};
                break;
            case 'tempo':
                return {title: "Tempo", content: "Only play songs whose tempo is within the range provided."};
                break;
            case 'duration':
                return {title: "Duration", content: "Only play songs whose duration is within the specified range in minutes."};
                break;
            case 'danceability':
                return {title: "Danceability", content: "Restricts the playlist to songs in the specified danceability range.  Danceability is based on beat strength, tempo stability, and other factors.  The higher the number, the more \"danceable\" a song is."};
                break;
            case 'energy':
                return {title: "Energy", content: "Restricts the playlist to songs in the specified energy range.  Energy includes loudness, segment durations, and other factors.  The higher the energy, the more \"energetic\" a song is."};
                break;
            case 'artist_hotttnesss':
                return {title: "Artist Hotttnesss", content: "Restricts the playlist to artists in the specified hotttnesss range.  Hotttnesss is a function of how culturally popular an artist is at this moment in time.  The higher the hotttnesss, the more popular the artist is."};
                break;
            case 'song_hotttnesss':
                return {title: "Song Hotttnesss", content: "Restricts the playlist to songs in the specified hotttnesss range.  Hotttnesss is a function of how culturally popular the song is at this moment in time.  The higher the hotttnesss, the more popular the song is."};
                break;
            case 'results':
                return {title: "Number of Songs", content: "Specify how many songs you want in the playlist."};
                break;
            case 'song':
                return {title: "Song", content: "Enter a song you like.  Give us the artist name and song title."};
                break;
            case 'artist':
                return {title: "Artist", content: "Enter an artist you like."};
                break;
            default:
                return {title: "", content: ""};
        }
    }

    function get_data_status() {
        var data_statuses = $('#constraints').find('.data-status'),
            data_status = null,
            n_success = 0,
            n_pending = 0,
            n_failure = 0,
            n_unused = 0;

        for (var i = 0; i < data_statuses.length; i++) {
            data_status = $(data_statuses[i]);
            switch (data_status.data("status")) {
                case "success":
                    n_success++;
                    break;
                case "pending":
                    n_pending++;
                    break;
                case "failure":
                    n_failure++;
                    break;
                case "":
                    n_unused++;
                    break;
                default:
            }
        }
        return {success: n_success, pending: n_pending, failure: n_failure, unused: n_unused}; 
    }

    function update_go_button(ev) {
        var s = get_data_status();
        var n_success = s.success;
        var n_pending = s.pending;
        var n_failure = s.failure;
        var n_unused = s.unused; 

        switch(ev.type) {
            case 'data-entry-pending':
            case 'data-entry-success':
            case 'data-entry-failure':
                $('#go_status').empty();
            case 'new-constraint':
            case 'remove-constraint':
            case 'slidechange':
                if ( n_failure > 0 ) {
                    $('#go').fadeOut(1000);
                } else if ( n_success > 0 ) {
                    $('#go_status').empty();
                    $('#go').fadeIn(1000);
                } else if ( n_success === 0 ) {
                    $('#go').fadeOut(1000);
                }
                break;
            case 'no-song-or-artist':
                $('#go_status').html('<span class="red"><b>!</b>  Enter a song or artist. &nbsp</span>'); 
                $('#go').fadeOut(1000);
                break;
            case 'making-playlist':
                $('#go_status').empty();
                $('#go').fadeOut(1000);
                break;
            default:
                break;
        }
    }

    function remove_playlist_constraint(ev){
        ev.preventDefault();
        var $this = $(this), $parent = $this.parents('.constraint'),
            type = $parent.data('type');
        $parent.remove();
        $('#'+type).removeClass('disabled');
        if (   $('.constraint[data-type="artist"]').length < 1
            && $('.constraint[data-type="song"]').length < 1 ) {
            $('#search-types .btn').removeClass('disabled');
        }
        $(document).trigger('remove-constraint');
    }

    function search_for_song_id(song_input) {
        var song_input = $(song_input),
            artist_input = $(song_input.parents('.constraint')).find('input.artist-search'),
            song_name = song_input.val(),
            artist_name = artist_input.val(),
            artist_id = null,
            args = {name: artist_name,
                    sort: "familiarity-desc",
                    results: 1};

        // get the most familiar artist by that name
        en_call('artist', 'search', args, function(data) {
            if (data.response.artists.length === 0) {
                song_input.trigger('data-entry-failure');
                return;
            }
            artist_id = data.response.artists[0].id;
            artist_input.data("id", artist_id);

            // get songs by that artist that match the song input
            args = {artist_id: artist_id,
                    title: song_name,
                    sort: "song_hotttnesss-desc",
                    results: 15,
                    bucket: ['id:spotify','tracks']
                   };

            en_call('song', 'search', args, function(data) {
                if (data.response.songs.length === 0) {
                    // no songs found
                    song_input.trigger('data-entry-failure');
                } else {
                    // we have songs, search for a song that also has
                    // a release image in one of its tracks
                    var song = null, track = null, tracks = null, keep_looking = true;
                    for (var i = 0; i < data.response.songs.length; i++) {
                        if (!keep_looking) { break; }
                        song = data.response.songs[i];
                        tracks = song.tracks;
                        for (var j=0; j < tracks.length; j++) {
                            if (!keep_looking) { break; }
                            track = tracks[j];
                            if (track.release_image !== undefined) {
                                song_input.trigger('data-entry-success',
                                    {song: song, track: track});
                                keep_looking = false;
                            }
                        }
                    }
                    // didn't find a song with a track with a release img
                    song_input.trigger('data-entry-success',
                        {song: data.response.songs[0],
                         track: {release_image: echonest_logo}
                        });
                }
            });
        });
    }

    function search_for_artist_id(artist_input) {
        var artist_input = $(artist_input),
            artist_name = artist_input.val(),
            artist_id = null,
            image_url = null,
            args = {name: artist_name,
                    sort: "familiarity-desc",
                    results: 1};

        // get the most familiar artist by that name
        en_call('artist', 'search', args, function(data) {
            if (data.response.artists.length === 0) {
                artist_input.trigger('data-entry-failure');
                return;
            }
            artist_id = data.response.artists[0].id;
            artist_name = data.response.artists[0].name;
            artist_input.trigger('data-entry-success', 
                {artist_id:artist_id, artist_name:artist_name}
            );
         });
    }

    function save_playlist(ev) {
        ev.preventDefault();
        console.log("starting save_playlist");
        if (playlist_songs) {
            require([
                '$api/models'
            ], function(models) {
                'use strict';
                if(!g_playlist_params )
                {
                    g_playlist_params = "Pace Maker Playlist";
                }
                var newPlaylist = models.Playlist.create(g_playlist_params).done(function(myplaylist) {
                    myplaylist.load('tracks').done(function(playlist) {
                        playlist.tracks.add( 
                                playlist_songs.map(function(song){
                                    return models.Track.fromURI(song.track.foreign_id);
                                })
                            );
                        // playlist_songs.forEach(function(song) {
                        //     playlist.tracks.add(models.Track.fromURI(song.track.foreign_id));
                        // });
                    });
                });
            });
        } else {
            console.log("playlist_songs empty!");
        }

    }



    function handle_toggle(ev){
        ev.preventDefault();
        var $this = $(ev.target);
        $this.parents('.btn-group').find('.btn').removeClass('active');
        $this.addClass('active');
    }

    function do_playlist(ev){

        ev.preventDefault();
        var s = get_data_status();
        if (s.failure > 0) {
            $(document).trigger('data-entry-failure');
            return;
        }
        if (s.pending > 0) {
            setTimeout(do_playlist, 500);
            return;
        }

        $(this).trigger('making-playlist');
        
        $('#playlist').remove();

        // read user's input on playlist artists, songs, and other constraints
        var playlist_args = {};
        var artist_id = null,
            song_name = null,
            song_id = null,
            song_constraints = null;
        var artist_name = null;
        var song_name = null;
        g_playlist_params = '';


        $('.constraint').each(function(){
            var $this = $(this),
                type = $this.data('type');
            
            if(type == 'artist') {
                playlist_args.type = 'artist-radio';
                artist_id = $this.find('.constraint-container').data('artist_id');
                artist_name = $this.find('.constraint-container').data('artist_name');
                if(!playlist_args.artist_id){playlist_args.artist_id = [];}
                playlist_args.artist_id.push(artist_id);
                if(artist_name.length > 6 )
                {
                    artist_name = artist_name.substring(0,6);
                }
                g_playlist_params += artist_name +"-" ;
                return;
            }
            if(type == 'song') {
                playlist_args.type = 'song-radio';
                song_id = $this.find('.constraint-container').data('song_id');
                song_name = $this.find('.constraint-container').data('song_name');
                if(!playlist_args.song_id){playlist_args.song_id = [];}
                playlist_args.song_id.push(song_id);
                if(song_name.length > 6) 
                {
                    song_name = song_name.substring(0,6);
                }
                g_playlist_params += song_name + "-";
                return;
            }
            if(type == 'distribution'){
                var val = $this.find('button.active').val();
                if(val){playlist_args.distribution = val;}
                return;
            }
            else { // a slider
                $this.find('.single-slider').each(function(){
                    playlist_args[$(this).data('param_name')] = $(this).slider("value"); 
                });
                $this.find('.double-slider').each(function(){
                    playlist_args[$(this).data('param1_name')] = $(this).slider("values")[0];
                    playlist_args[$(this).data('param2_name')] = $(this).slider("values")[1];
                    if($(this).data('param1_name') === 'min_tempo') {
                        g_playlist_params =  $(this).slider("values")[0] + 
                                            "-" +$(this).slider("values")[1]+ g_playlist_params;
                    }
                });
            }
        });

        // catch erroneous input--if found, don't make call for playlist
        if (playlist_args.type === undefined) {
            $(document).trigger('no-song-or-artist');
            return;
        } 

        if(g_playlist_params.charAt(g_playlist_params.length -1) === "-") {
            g_playlist_params = g_playlist_params.slice(0,-1);
        }
        console.log("playlist name = " + g_playlist_params);;

        var playlist_name = $('#playlist_field').val();

        if( !playlist_name ||  !playlist_name.trim()) {
            console.log("no name suggested");
            $('#playlist_field').val(g_playlist_params);
        } else {
            g_playlist_params = playlist_name;
        }


        if ( ( playlist_args.song_id !== undefined 
                      && playlist_args.song_id.length >= 1 
                      && playlist_args.song_id[0] === "" )
                    || 
                    ( playlist_args.artist !== undefined 
                      && playlist_args.artist.length >= 1 
                      && playlist_args.artist[0] === "" ) ) {
            $(document).trigger('no-song-or-artist');
            return;
        }

        // input was good - make call for playlist now
        $('#playlist-target').html(templates.playlist_loading());
   
        en_call('playlist', 'static', _.extend({}, playlist_args, playlist_standard_args), function(data){
            
            $('#playlist-target').html(templates.playlist_wrapper());
            var target = $('#playlist');
            
            var songs = data.response.songs;
            if (songs.length === 0) {
                target.html("We couldn't find anything that fit within those constraints.  Try using fewer constraints to make your search broader.");
                return;
            }

            // only get songs that have a track with foreign_id
            var mysongs = [];
            for (var i = 0; i < songs.length; ++i) {
                var song = songs[i],
                    track = null;
                for (var j = 0; j < song.tracks.length; ++j) {
                    if (song.tracks[j].foreign_id) {
                        track = song.tracks[j];
                        break;
                    }
                }
                if (!track) {
                    continue;
                }
                song.track = track;
                mysongs.push(song);
            }

            // give each song additional data
            for (var i = 0; i < mysongs.length; i++) {
                var song = mysongs[i];
                if (i == 0) { song.prev = "first"; }
                if (i > 0) { song.prev = mysongs[i-1].id; }
                if (i < songs.length-1) { song.next = mysongs[i+1].id; }
                if (i == songs.length-1) { song.next = "last"; }
            }

            console.log("mysongs" + mysongs);
            if (mysongs.length > 0) {
                playlist_songs = mysongs;
                $('#playlist_input').show();
            } else {
                playlist_songs = null;
                $('#playlist_input').hide();
            }
            // render
            $('#playlist').html(templates.playlist_items({songs:mysongs}));
            $('#playlist').find('.play-button-inner').each(function(){
                var sound = mySoundManager.createSound({
                    id: this.id,
                    url: $(this).data('mp3'),
                    autoLoad: true,
                    autoPlay: false,
                    volume: 30,
                    onfinish: play_next_song,
                    onload: on_loaded,
                });
                $(this).data({sound:sound, status:'loading'});
                $(this).on('click', play_or_pause_song);
            });
        }); // end of make_call_for_playlist callback
    } // end of do_playlist


    // together, play_or_pause_song and play_next_song manage the display of playlist songs
    function play_or_pause_song(ev) {
        ev.preventDefault();
        var $this = $(this),
            sound = $this.data("sound"),
            id = $this.attr('id');
        $('.play-button-inner').each(function(){
            if (this.id !== id && $(this).data('status') === 'playing') {
                pause_song(this);
            }
        });
        switch($this.data("status")) {
            case "":
                sound.play();
                $this.find('img').each(function(){
                    $(this).attr('src', 'static/img/pause.png');    
                });
                $this.data("status", "playing");
                break; 
            case "playing":
                pause_song(this);
                break;
            case "paused":
                sound.resume();
                $this.find('img').each(function(){
                    $(this).attr('src', 'static/img/pause.png');    
                });
                $this.data("status", "playing");
                break;
            case "finished":
                sound.stop();
                $this.find('img').each(function(){
                    $(this).attr('src', 'static/img/play.png');
                });
                $this.data("status", "");
                break;
            case "loading":
                break;
            default:
                console.log("play_song: status of song is weirdly ", $(this).data("status"));
        }
        function pause_song(p) {
            var $this = $(p),
                sound = $this.data("sound");

            sound.pause();
            $this.find('img').each(function(){
                $(this).attr('src', 'static/img/play.png');
            });
            $this.data("status", "paused");
        }
    }

    function on_loaded(ev) {
        var $p = $('.play-button-inner#'+this.id);
        $p.find('img').first().attr('src', 'static/img/play.png');
        $p.data('status', '');
    }

    function play_next_song(ev) {
        var this_play_button = $('.play-button-inner#'+this.id);
        this_play_button.data('status','finished');
        this_play_button.trigger('click');
        var next_song_id = this_play_button.data('next_song');
        if (next_song_id == 'last') { return; }
        var next_play_button = $('.play-button-inner#'+next_song_id);
        next_play_button.trigger('click');
    }

    $(document).ready(function(){
        mySoundManager = soundManager.setup({
            debugMode: false,
        }); 

        $('script[type="underscore/template"]').each(function(){
            templates[$(this).attr("id")] = _.template($(this).text());
        });
        $('#playlist-options').on('click', 'a:not(.dropdown-toggle):not(.disabled)', add_playlist_constraint);
        $('#constraints').on('click', 'a.close', remove_playlist_constraint);
        $('#constraints').on('click', 'button.toggle', handle_toggle);
        
        $('#go').on('click', do_playlist);
        $('#save_playlist').on('click', save_playlist);
        $(document).on('data-entry-success data-entry-failure data-entry-pending data-entry-clear new-constraint remove-constraint no-song-or-artist', update_go_button);
        
    });

