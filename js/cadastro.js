const form = document.getElementById('vagaForm');

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const vaga = {
      cargo: document.getElementById('cargo').value,
      valor: document.getElementById('valor').value
    };

    try {
      const response = await fetch('http://localhost:3000/vagas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vaga)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar vaga');
      }

      const data = await response.json();
      console.log('Vaga criada:', data);
      alert('Vaga criada com sucesso!');
      form.reset();
    } catch (error) {
      console.error(error);
      alert('Falha ao criar vaga. Veja o console para mais detalhes.');
    }
  });
}
