<link href="https://cdnjs.cloudflare.com/ajax/libs/gridstack.js/1.1.2/gridstack.min.css" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/gridstack.js/1.1.2/gridstack.all.js"></script>

<div class="grid-stack"></div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const grid = GridStack.init();

  // Example of adding a new widget with a title and delete button
  grid.addWidget(`<div class="grid-stack-item" data-gs-width="4" data-gs-height="2">
    <div class="grid-stack-item-content">
      <div class="widget-title">My Widget</div>
      <button class="delete-widget">X</button>
      <!-- Your content here -->
    </div>
  </div>`);

  // Attach delete event listener
  document.querySelectorAll('.delete-widget').forEach(button => {
    button.addEventListener('click', function() {
      const item = this.closest('.grid-stack-item');
      grid.removeWidget(item);
    });
  });
});
</script>


