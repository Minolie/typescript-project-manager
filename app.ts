// Drag and Drop Interfaces

interface Dragable {

}

interface DragTarget {
    
}

// Project type
enum ProjectStatus { Active, Finished }

//customized project structure
//it's call and not a type or an interface is because we need to be able to instantiate the object later
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus) {

    }
}

// Project State Management
type Listener<T> = (items: T[]) => void;
//type becuase to encode a function type with one word
//it is a function that receieves items
//void because we don't care about the return types this function returns

class State<T> {
    //listeners that would be called whenever something gets changed
    // the access modifier is protected because it can be accessed by inheritance and also private -> gives access outside the base class
   protected listeners: Listener<T>[] = []; 
    addListener(listenerFn: Listener<T>) {
        //array of functions 
        //when a new project is addedm, this would get called
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project>  {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
     }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }


    addProject(title: string, description: string, numOfPeople: number) {
        // const newProject = {
        //     id: Math.random().toString(),
        //     title: title,
        //     description: description,
        //     people: numOfPeople
        // };
        const newProject = new Project( //redifined object after adding custom object type
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        )
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice()); //slice used to return a copy of the array not the orginal so that it can't be edited from wher it's called - the listening function
        }
    }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if (
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
            isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if (
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ) {
        isValid =
            isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if (
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if (
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'
    ) {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    //get acess to the original method
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            //should be exectued when we try to access the function
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

// Component Bass Class - this is a generic class
// when we inherit from it we can set concrete types
// class made abstract to prevent direct instantiating
// this class should only used for inheritance
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string) {

        this.templateElement = document.getElementById(
            templateId
        )! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;


        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        //content is a priprty that exsist on HTMLTemplateElement that gives a reference to the content 
        //of the reference
        //true is passed as a second argument to allow all levels of nesting
        this.element = importedNode.firstElementChild as U;
        if (newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// ProjectItem Class

class ProjectItem extends Component<HTMLLIElement, HTMLUListElement>{

    private project: Project;

    get personsTerms () {

        if(this.project.people === 1) {
            return "1 person";
        } else {
            return `${this.project.people} persons`
        }
    }
    constructor(hostId: string, project: Project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        
        this.configure();
        this.renderContent();
    }
    
    configure(): void {
        
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.personsTerms;
        this.element.querySelector('p')!.textContent = this.project.description;

    }
}
// ProjectList Class
class ProjectList extends Component<HTMLElement, HTMLDivElement>{
    assignedProjects: Project[] ;

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`); //calls the constructor of the base class -- we can't use 'this' ${this.type}-projects. in super()

        this.assignedProjects = [];

        this.configure();
        this.renderContent();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '' // prevents the duplicatoin of the projects when a new project gets added
        //set to an empty string to get rid of all list items and re-render
        //that means when we add a new projects, we re-render all the projects are
        for (const prjItem of this.assignedProjects) {
            // const listItem = document.createElement('li');
            // listItem.textContent = prjItem.title;
            // listEl.appendChild(listItem)
            new ProjectItem(this.element.querySelector('ul')!.id, prjItem )
        }
    }

    configure() {
        //content is a priprty that exsist on HTMLTemplateElement that gives a reference to the content 
        //of the reference
        //true is passed as a second argument to allow all levels of nesting
        // this.element = importedNode.firstElementChild as HTMLElement;
        // this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: Project[]) => {
            //filter the project before saving and rendering them
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent() {
        const listId = `${this.type}-projects-list`; //template literal to inject dynamic content
        this.element.querySelector('ul')!.id = listId; //unordetred lis
        this.element.querySelector('h2')!.textContent =
        this.type.toUpperCase() + ' PROJECTS';
    }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement >{
    // templateElement: HTMLTemplateElement; // dom has been added in the tsconfig.json
    // hostElement: HTMLDivElement;
    // element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input','app', true, 'user-input' );

        this.titleInputElement = this.element.querySelector(
            '#title'
        ) as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector(
            '#description'
        ) as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector(
            '#people'
        ) as HTMLInputElement;

        // const importedNode = document.importNode(
        //     this.templateElement.content,
        //     true
        // );
        //content is a priprty that exsist on HTMLTemplateElement that gives a reference to the content 
        //of the reference
        //true is passed as a second argument to allow all levels of nesting
        // this.element = importedNode.firstElementChild as HTMLFormElement;
        // this.element.id = 'user-input';

        this.configure();
    }

    configure() {
        //bind - to pre-configure how this function is going to execute when it executes in the future
        // this.element.addEventListener('submit', this.submitHandler.bind(this)); <-- commented this because of the decorator written to bind
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent(): void {
        
    }

    private gatherUserInput(): [string, string, number] | void {

        //returing exactly three elements of these three exact return types - returns a tuple
        //adding a 'void' return type because in case it goes through the if condition, it does not return a tuple

        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid input, please try again!');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        //prevents default values from submitting which would trigger a http submission to be sent
        event.preventDefault();
        const userInput = this.gatherUserInput();
        //tuple is a TS feature, what it is is an array - a fixed structure.
        // there is no method to check if it's an array so we use a vanilla JS function called Array.isArray()
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }


}

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
