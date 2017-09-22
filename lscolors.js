//ExGxFxDxCxDxDxhbhdacEc

$(document).ready(function() {
    // the order is important as this is used to calculate colors later on!
    var available_colors = new Array('black', 'red', 'green', 'brown', 'blue', 'magenta', 'cyan', 'grey', 'default');
    var available_filetypes = new Array('directory', 'system_link', 'socket', 'pipe', 'executable', 'block_special', 'char_special', 'exe_setuid', 'exe_setgid', 'dir_writeothers_sticky', 'dir_writeothers_nosticky');
    var filetype_keys = new Array('di', 'ln', 'so', 'pi', 'ex', 'bd', 'cd', 'su', 'sg', 'tw', 'ow');

    // default setup
    var selected_foreground_colors = new Array('blue', 'cyan', 'magenta', 'brown', 'green', 'brown', 'brown', 'grey', 'grey', 'black', 'blue');
    var selected_background_colors = new Array('default', 'default', 'default', 'default', 'default', 'default', 'default', 'red', 'brown', 'green', 'green');
    var selected_foreground_bold = new Array(1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1);
    var selected_background_bold = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

    // create color selection table
    function create_color_selection_table() {
        $.each(available_filetypes, function(i) {
            var tr = $('<tr>');

            var td_filetype = $('<td>').html(available_filetypes[i]);
            var td_bold = $('<td>').html(create_bold_checkbox(available_filetypes[i]));
            var td_foreground = $('<td>').html(create_color_selection(available_filetypes[i]+'-foreground'));
            var td_background = $('<td>').html(create_color_selection(available_filetypes[i]+'-background'));

            $('table#colorselectiontable').append(tr.append(td_filetype, td_bold, td_foreground, td_background));
        });
    }

    // create bold checkbox
    function create_bold_checkbox(id) {
        var span = $('<span class="box bold_checkbox" id="checkbox_bold-'+id+'">');
        span.click(function(){ click_bold_checkbox('checkbox_bold-'+id) });
        return span;
    }

    // create color selection bar
    function create_color_selection(id) {
        var list = $('<div class="colorselector" id="selector-'+id+'">');
        $.each(available_colors, function(i) {
            span = $('<span class="box '+available_colors[i]+'">');
            span.click(function(){ click_color_selection('selector-'+id,available_colors[i])});
            list.append(span);
        });
        return list;
    }

    // handle clicks on bold checkboxes
    function click_bold_checkbox(id) {
        var split_id = id.split('-');

        selected_foreground_bold[available_filetypes.indexOf(split_id[1])] = !selected_foreground_bold[available_filetypes.indexOf(split_id[1])];
        update_everything();
    }

    // handle clicks on color selections
    function click_color_selection(id, color) {
        var split_id = id.split('-');
        var filetype = split_id[1];
        var forebackground = split_id[2];
        var filetype_id = available_filetypes.indexOf(filetype);
        (forebackground == 'foreground' ? selected_foreground_colors : selected_background_colors)[filetype_id] = color;

        update_everything();
    }

    // update everything
    function update_everything() {
        update_color_selection();
        update_example();
        update_bold_checkboxes();
        update_lscolors();
        update_ls_colors();
    }

    // update color_selection
    function update_color_selection() {
        // remove all previous selections
        $('.colorselector span').removeClass('selected');

        // mark current selections
        $.each($('.colorselector'), function() {
            var split_id = $(this).attr('id').split('-');
            var filetype = split_id[1];
            var forebackground = split_id[2];
            var filetype_id = available_filetypes.indexOf(filetype);
            $(this).find('.'+(forebackground == 'foreground' ? selected_foreground_colors : selected_background_colors)[filetype_id]).addClass('selected');

        });
    }

    // update bold checkboxes
    function update_bold_checkboxes() {
        $.each($('.bold_checkbox'), function() {
            var split_id = $(this).attr('id').split('-');
            selected_foreground_bold[available_filetypes.indexOf(split_id[1])] ? $(this).addClass('checked') : $(this).removeClass('checked');
        });
    }

    // update example
    function update_example() {
        $.each($('.example_entry'), function() {
            var span = $(this);
            var id = span.attr('id');

            // remove all colors
            $.each(available_colors, function(i) {
                span.removeClass('foreground_'+available_colors[i]);
                span.removeClass('background_'+available_colors[i]);
                span.removeClass('foreground_bold');
                span.removeClass('background_bold')
            });

            if (available_filetypes.indexOf(id) != undefined) {

                span.addClass('foreground_'+selected_foreground_colors[available_filetypes.indexOf(id)]);
                span.addClass('background_'+selected_background_colors[available_filetypes.indexOf(id)]);
                selected_foreground_bold[available_filetypes.indexOf(id)] ? span.addClass('foreground_bold') : 0 ;
                selected_background_bold[available_filetypes.indexOf(id)] ? span.addClass('foreground_bold') : 0 ;
            };
        });
    }

    function get_bsd_color(color, bold) {
        var color_number = available_colors.indexOf(color);

        if (color_number <= 7) {
            return String.fromCharCode((bold ? 'A'.charCodeAt(0) : 'a'.charCodeAt(0))+ color_number);
        } else {
            return 'x';
        }
    }

    // create LSCOLORS string (http://www.manpages.info/freebsd/ls.1.html)
    function update_lscolors() {
        var lscolors = '';

        for (var i=0;i<11;i++) {
            lscolors += get_bsd_color(selected_foreground_colors[i], selected_foreground_bold[i]);
            lscolors += get_bsd_color(selected_background_colors[i], selected_background_bold[i]);
        }

        $('#lscolors').val(lscolors);
        $('#lscolors').keyup();
    }

    // adjust lscolors width
    $('#lscolors').keyup(function(){
        $('<span id="width_lscolors">').append( $(this).val() ).appendTo('body');
        $(this).width( $('#width_lscolors').width() + 0 );
        $('#width_lscolors').remove();
    });

    $('#lscolors').keypress(function(e) {
        if(e.which == 13) {
            parse_lscolors();
        }
    });

    // parse input from lscolors
    function parse_lscolors() {
        var lscolors = $('#lscolors').val();
        for (var i=0;i<11;i++) {
            var foreground_char = lscolors.charCodeAt(2*i);
            var background_char = lscolors.charCodeAt(2*i+1);

            if ((foreground_char >= 'A'.charCodeAt(0)) && (foreground_char <= 'H'.charCodeAt(0))) {
                selected_foreground_bold[i] = 1;
                selected_foreground_colors[i] = available_colors[foreground_char-'A'.charCodeAt(0)];
            } else if ((foreground_char >= 'a'.charCodeAt(0)) && (foreground_char <= 'h'.charCodeAt(0))) {
                selected_foreground_bold[i] = 0;
                selected_foreground_colors[i] = available_colors[foreground_char-'a'.charCodeAt(0)];
            } else {
                selected_foreground_bold[i] = 0;
                selected_foreground_colors[i] = 'default';
            }

            if ((background_char >= 'A'.charCodeAt(0)) && (background_char <= 'H'.charCodeAt(0))) {
                selected_background_bold[i] = 1;
                selected_background_colors[i] = available_colors[background_char-'A'.charCodeAt(0)];
            } else if ((background_char >= 'a'.charCodeAt(0)) && (background_char <= 'h'.charCodeAt(0))) {
                selected_background_bold[i] = 0;
                selected_background_colors[i] = available_colors[background_char-'a'.charCodeAt(0)];
            } else {
                selected_background_bold[i] = 0;
                selected_background_colors[i] = 'default';
            }
        }

        update_everything();
    }

    function get_linux_color(foreground_color, foreground_bold, background_color) {
        var color = '';

        if (foreground_bold)
            color += "01;"

        // foreground color
        if (foreground_color=='default' || foreground_color=='black') {
            color += '00';
        } else {
            color += (30+available_colors.indexOf(foreground_color));
        }

        // foreground color
        if (background_color != "default") {
            color += ';'+(40+available_colors.indexOf(background_color));
        }

        return color;
    }

    // update ls_colors
    function update_ls_colors() {
        var ls_colors = '';

        for (var i=0;i<11;i++) {
            ls_colors += filetype_keys[i]+'='+get_linux_color(selected_foreground_colors[i], selected_foreground_bold[i], selected_background_colors[i])+':';
        }

        $('#ls_colors').val(ls_colors);
        $('#ls_colors').keyup();
    }

    // adjust ls_colors height
    $('#ls_colors').keyup(function(){
        $(this).height( 0 );
        $(this).height( this.scrollHeight );
    });

    $('#ls_colors').keypress(function(e) {
        if(e.which == 13) {
            parse_ls_colors();
        }
    });

    // parse input from ls_colors
    function parse_ls_colors() {
        var ls_colors = $('#ls_colors').val();

        var settings = ls_colors.split(':');

        for (i = 0; i < settings.length; ++i) {
            if (settings[i] != "") {
                var first_split = settings[i].split('=');
                var filetype_index = filetype_keys.indexOf(first_split[0]);
                if (filetype_index == undefined)
                    continue;
                var colors = first_split[1].split(';');

                // reset bold & colors
                selected_foreground_bold[filetype_index] = 0;
                selected_foreground_colors[filetype_index] = "default";
                selected_background_colors[filetype_index] = "default";

                // go thru all colors
                for (j = 0; j < colors.length; ++j) {
                    switch(colors[j]) {
                        case "0":
                        case "00":
                            selected_foreground_colors[filetype_index] = "default";
                            break;
                        case "01":
                            selected_foreground_bold[filetype_index] = 1;
                            break;
                        case "31":
                            selected_foreground_colors[filetype_index] = "red";
                            break;
                        case "32":
                            selected_foreground_colors[filetype_index] = "green";
                            break;
                        case "33":
                            selected_foreground_colors[filetype_index] = "brown";
                            break;
                        case "34":
                            selected_foreground_colors[filetype_index] = "blue";
                            break;
                        case "35":
                            selected_foreground_colors[filetype_index] = "magenta";
                            break;
                        case "36":
                            selected_foreground_colors[filetype_index] = "cyan";
                            break;
                        case "37":
                            selected_foreground_colors[filetype_index] = "grey";
                            break;
                        case "40":
                            selected_background_colors[filetype_index] = "default";
                            break;
                        case "41":
                            selected_background_colors[filetype_index] = "red";
                            break;
                        case "42":
                            selected_background_colors[filetype_index] = "green";
                            break;
                        case "43":
                            selected_background_colors[filetype_index] = "brown";
                            break;
                        case "44":
                            selected_background_colors[filetype_index] = "blue";
                            break;
                        case "45":
                            selected_background_colors[filetype_index] = "magenta";
                            break;
                        case "46":
                            selected_background_colors[filetype_index] = "cyan";
                            break;
                        case "47":
                            selected_background_colors[filetype_index] = "grey";
                            break;
                   } 
                }

            }
        }

        update_everything();
    }

    // init everything
    create_color_selection_table();
    update_everything();
    $('#terminal_color').change( function() { 
            $.each( $('.example'), function() { 
                    var example = $(this); 
                    //example.css('background-color', "#CCEED0") ; 
                    example.css('background-color', $("#terminal_color").val() ) ; 
                    //alert( $("#terminal_color").val() ) ; 
                    });


    } ) ;
});

