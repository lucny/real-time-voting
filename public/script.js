document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const nameInput = document.getElementById('nameInput');
    const option1Elem = document.getElementById('option1');
    const option2Elem = document.getElementById('option2');
    const voteOption1Btn = document.getElementById('voteOption1');
    const voteOption2Btn = document.getElementById('voteOption2');
    const option1NamesElem = document.getElementById('option1Names');
    const option2NamesElem = document.getElementById('option2Names');
  
    nameInput.addEventListener('input', () => {
      const name = nameInput.value.trim();
      voteOption1Btn.disabled = !name;
      voteOption2Btn.disabled = !name;
    });
  
    socket.on('currentVotes', (votes) => {
      updateVotes(votes);
    });
  
    socket.on('voteUpdate', (votes) => {
      updateVotes(votes);
    });
  
    socket.on('voteDenied', (message) => {
      alert(message);
    });
  
    window.vote = (option) => {
      const name = nameInput.value.trim();
      if (name) {
        socket.emit('vote', { option, name });
      }
    };
  
    function updateVotes(votes) {
      option1Elem.textContent = votes.option1.count;
      option2Elem.textContent = votes.option2.count;
      option1NamesElem.innerHTML = votes.option1.names.map(name => `<div>${name}</div>`).join('');
      option2NamesElem.innerHTML = votes.option2.names.map(name => `<div>${name}</div>`).join('');
    }
  });
  