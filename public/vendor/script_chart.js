//dans l'avenir ce petit bout de code doit être un appel vers la DB

        var response = $(dataHTML);
        response = JSON.parse(response[0].innerText);

        function timeConverter(UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var time = date + ' ' + month + ' ' + year ;
            return time;
          }
        
        //extraire les données
        var date = [];
        var reward = [];
        for(i=0; i<response.rows.length; i++){
            date.push(timeConverter(response.rows[i].dividend_time));
            reward.push(parseInt(response.rows[i].total_eos,10))
        };
        var ctx = document.getElementById('myChart').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: date,
                datasets: [{
                    label: 'Pool Reward',
                    data: reward,
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });