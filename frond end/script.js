const bus1 = document.querySelector('.bus1');
const img1 = document.querySelector('.img1');
const s1 = document.querySelector('.s1');
const table = document.querySelector('.table');
let totalAmount = 0;
const amount = document.querySelector('span');
const select = document.querySelector('.select');
const b2 = document.querySelector('.b2');
const seatArray = [];
const seatID = [];
bus1.addEventListener('click', async () => {
  b2.style.display = 'none';
  select.style.display = 'block';
  img1.style.display = 'block';
  s1.style.display = 'block';
  const date = '2023-12-12';
  const encodeDate = encodeURIComponent(date);

  const url = `http://localhost:3001/user/viewSeats?date = ${encodeDate}`;
  await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDE5MjA5NjAsImV4cCI6MTcwMTkyMzk2MH0.LqsT6aY8T6Yhd41mP31vg9Ho2eGAgkn_LH7fGpg95H8',
    },
    body: JSON.stringify({ date }),

  })
    .then((response) => response.json())
    .then((data) => {
      seatArray.push(data.message);

      for (let i = 0; i < seatArray.length; i += 1) {
        for (let j = 0; j < seatArray[i].length; j += 1) {
          const seat = seatArray[i][j];
          if (seat.busId === 1) {
            const row = document.createElement('tr');
            if (seat.offerPrice === 0) {
              row.innerHTML = `
                <td style="width: 150px">${seat.id}</td>
                <td class="seatType">${seat.seatType}</td>
                <td><button style="background-color: green;"><span class="spanele">${seat.seatCost}</span></button></td>
                <td class="offData"> </td>
              `;
            } else {
              row.innerHTML = `
                <td style="width: 150px">${seat.id}</td>
                <td class="seatType">${seat.seatType}</td>
                <td><span class="spanele" style="text-decoration: line-through">${seat.seatCost}</span></td>
                <td class="offData"><button style="background-color: green;">${seat.offerPrice}</button></td>
              `;
            }

            table.appendChild(row);

            const button = row.querySelector('button');
            // eslint-disable-next-line no-loop-func
            button.addEventListener('click', () => {
              button.style.backgroundColor = 'red';
              seatID.push(seat.id);
              if (seat.offerPrice === 0) {
                totalAmount += seat.seatCost;
              } else {
                totalAmount += seat.offerPrice;
              }
              amount.textContent = totalAmount;
            });
          }
        }
      }
    })
    .catch((error) => {
      console.log('Error:', error);
    });
});
