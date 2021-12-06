document.addEventListener("DOMContentLoaded", function(){
    fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        const canvas = document.getElementById('field');
        let gr = new Graphic(canvas, {
            model_field: 'model',
            name_field: 'name',
            price_field: 'price',
            drive_field: 'drive',
            unique: true,
            text_color: '#222222',
            lines_color: '#AAAAAA',
            circles_color: '#555555',
            circle_distance: 1,
            radius: 4,
            first_drives: [
                {drive: 'FWD', color: '#00B050'},
                {drive: '4WD', color: '#FF0000'}
            ]
        });
        gr.init(data);
        gr.draw()
    });
});