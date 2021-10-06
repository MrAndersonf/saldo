function toggleMenu() {
    let toggle = document.querySelector(".toggle");
    let navigation = document.querySelector(".navigation");
    let main = document.querySelector(".main");
    toggle.classList.toggle("active");
    navigation.classList.toggle("active");
    main.classList.toggle("active");
  }
  function menuhandle(id) {
    this.event.preventDefault()

    let menuItems = document.getElementsByTagName('ul')[0].getElementsByTagName('li')

    for (let index = 0; index < menuItems.length; index++) {
      const element = menuItems[index];
      let currentClass = element.className;
      let anchor = element.getElementsByTagName('a')[0]
      console.log(anchor.getAttribute('id'))
      if (anchor.getAttribute('id') === id) {
        element.classList.add('active')
      }
    }
  }