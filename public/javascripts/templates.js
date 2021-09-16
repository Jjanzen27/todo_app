export class Template {
  constructor() {
    this.templates = {};
    this.compileTemplates();
    this.registerPartials();
    this.registerHelpers();
  }
  
  compileTemplates() {
    let scripts = document.querySelectorAll("script[type='text/x-handlebars']");
    
    for (let i = 0; i < scripts.length; i += 1) {
      let templateName = scripts[i].id;
      this[templateName]= Handlebars.compile(scripts[i].innerHTML)
    }
  }
  
  registerPartials() {
    let partials = document.querySelectorAll("script[data-type='partial']");
    
    for (let i = 0; i < partials.length; i += 1) {
      Handlebars.registerPartial(partials[i].id, partials[i].innerHTML);
    }
  }
  
  registerHelpers() {
    Handlebars.registerHelper('formatDate', function(todo) {
      if (todo.month && todo.year) {
        return `${todo.month}/${todo.year.slice(2, 4)}`;
      } else {
        return "No Due Date";
      }
    });
  
    Handlebars.registerHelper('templateDays', function(day) {
      let options = [];
      let option;
      let value;
      
      for (let i = 1; i < 31; i +=1 ) {
        value = String(i);
        if (value.length === 1) { value = "0" + value }
        if (day == value) {
          option = `<option selected value="${day}">${value}</option>`;
        } else {
          option = `<option value="${value}">${value}</option>`;
        }
         options.push(option);
      }
      
      return options.join();
    });
    
    Handlebars.registerHelper('templateMonths', function(month) {
      let options = [];
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
      let option;
      let value;
      
      for (let i = 0; i < months.length; i += 1) {
        value = String(i + 1);
        if (value.length === 1) { value = "0" + value }
        if (month == value) {
          option = `<option selected value="${value}">${months[i]}</option>`;
        } else {
          option = `<option value="${value}">${months[i]}</option>`;
        }
        options.push(option);
      }
      
      return options.join();
    });
    
    Handlebars.registerHelper('templateYears', function(year) {
      let options = [];
      let option;
      
      for (let i = 2021; i < 2030; i += 1) {
        if (year == i) {
          option = `<option selected>${i}</option>`
        } else {
          option = `<option>${i}</option>`
        }
        
        options.push(option);
      }
      
      return options.join();
    });
  }    
}      