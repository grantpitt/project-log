
window.onload = function() {
    console.log('yup');
    $('#myModal').modal('show');
};


const feild = document.getElementById('field');
const indicator = document.getElementById('indicator');
// const nameVector = document.getElementById('nameVector');

const SRT = 2.50662827463;
let h = 0.1;

const boys = ['Liam','Noah','William','James','Oliver','Benjamin','Elijah','Lucas','Mason','Logan','Alexander','Ethan','Jacob','Michael','Daniel','Henry','Jackson','Sebastian','Aiden','Matthew','Samuel','David','Joseph','Carter','Owen','Wyatt','John','Jack','Luke','Jayden','Dylan','Grayson','Levi','Issac','Gabriel','Julian','Mateo','Anthony','Jaxon','Lincoln','Joshua','Christopher','Andrew','Theodore','Caleb','Ryan','Asher','Nathan','Thomas','Leo','Isaiah','Charles','Josiah','Hudson','Christian','Hunter','Connor','Eli','Ezra','Aaron','Landon','Adrian','Jonathan','Nolan','Jeremiah','Easton','Elias','Colton','Cameron','Carson','Robert','Angel','Maverick','Nicholas','Dominic','Jaxson','Greyson','Adam','Ian','Austin','Santiago','Jordan','Cooper','Brayden','Roman','Evan','Ezekiel','Xavier','Jose','Jace','Jameson','Leonardo','Bryson','Axel','Everett','Parker','Kayden','Miles','Sawyer','Jason'];
const girls = ['Emma','Olivia','Ava','Isabella','Sophia','Charlotte','Mia','Amelia','Harper','Evelyn','Abigail','Emily','Elizabeth','Mila','Ella','Avery','Sofia','Camila','Aria','Scarlett','Victoria','Madison','Luna','Grace','Chloe','Penelope','Layla','Riley','Zoey','Nora','Lily','Eleanor','Hannah','Lillian','Addison','Aubrey','Ellie','Stella','Natalie','Zoe','Leah','Hazel','Violet','Aurora','Savannah','Audrey','Brooklyn','Bella','Claire','Skylar','Lucy','Paisley','Everly','Anna','Caroline','Nova','Genesis','Emilia','Kennedy','Samantha','Maya','Willow','Kinsley','Naomi','Aaliyah','Elena','Sarah','Ariana','Allison','Gabriella','Alice','Madelyn','Cora','Ruby','Eva','Serenity','Autumn','Adeline','Hailey','Gianna','Valentina','Isla','Eliana','Quinn','Nevaeh','Ivy','Sadie','Piper','Lydia','Alexa','Josephine','Emery','Julia','Delilah','Arianna','Vivian','Kaylee','Sophie','Brielle','Maddie','Kate'];
const dogs = ['Brownie','Maggie','Blue','Spot','Biscuit','Ace','Billy','Buck','Charlie','Chica','Duke','Goldie','Jasper'];


feild.addEventListener('input', () => {
    update(feild.value);
})

function update(name) {
    if (name == '') {
        indicator.style.background = '';
        nameVector.innerText = '';
    }
    name = name.toLowerCase();
    let featureVector = getFeatureVector(name);
    let label = getLabel(name);
    // console.log(label);
    // nameVector.innerHTML= `[${featureVector.join('&nbsp;&nbsp;')}]`;
    if (label == 2) {
        indicator.style.backgroundImage = "url('dog.jpg')";
        indicator.style.backgroundSize = 'cover';
        indicator.style.backgroundPosition = 'center';
    } else if (label == 0) {
        indicator.style.background = 'rgb(54, 171, 255)';
    } else if (label == 1) {
        indicator.style.background = 'rgb(255, 143, 240)';
    }
}

function getFeatureVector(name) {
    const len = name.length;
    const vect = [0, 0, 0, 0, 0, 0];
    // iterate and grab the features we want
    for (let i = 0; i < 3; i++) {
        if (i >= len) {
            break;
        }
        for (let j = i; j < 3; j++) {
            vect[j] = Number(`${vect[j]}${name.charCodeAt(i)}`);
            vect[5 - j] = Number(`${vect[5 - j]}${name.charCodeAt(len - 1 - i)}`);
            // vect[j] += ((i + 1) * name.charCodeAt(i));
            // vect[5 - j] += ((i + 1) * name.charCodeAt(len - 1 - i));
        }
    }
    return vect;
}

function getLabel(nameVect) {
    let w = {
        prob: -1,
        class: -1
    }
    for (let c = 0; c < 3; c++) {
        let p = getNaiveBayesPrediction(nameVect, c);
        // console.log(p);
        if (p > w.prob) {
            w.prob = p;
            w.class = c;
        }
    }
    return w.class;
}

// class 0 = boys, 1 = girls, 2 = dogs
function getProb(nameVect, c) {
    nameVect = getFeatureVector(nameVect);
    let dataSet;
    if (c == 0) {
        dataSet = boys;
    } else if (c == 1) {
        dataSet = girls;
    } else if (c == 2) {
        dataSet = dogs;
    }
    let len = dataSet.length;
    let sum = [0, 0, 0, 0, 0, 0]
    for (let p of dataSet) {
        // console.log(p);
        let vect = getFeatureVector(p.toLowerCase());
        // console.log(vect);
        // console.log(nameVect[0], vect[0], h);
        for (i = 0; i < 6; i++) {
            // console.log(f(nameVect[i], vect[i], h))
            sum[i] += f(nameVect[i], vect[i], h);
        }
    }
    let prob = Math.sqrt(h);
    for (let j = 0; j < 6; j++) {
        prob *= (sum[j] / len);
    }
    // console.log(prob);
    return prob;
}

function f(feature, Mu, Sigma) {
    return ((1/(Sigma * SRT)) * Math.exp((-1/2) * Math.pow(((feature - Mu) / Sigma), 2)));
}

function getNaiveBayesPrediction(nameVect, c) {
    nameVect = getFeatureVector(nameVect);
    let dataSet;
    if (c == 0) {
        dataSet = boys;
    } else if (c == 1) {
        dataSet = girls;
    } else if (c == 2) {
        dataSet = dogs;
    }
    let len = dataSet.length;
    let sum = [0, 0, 0, 0, 0, 0]
    for (let p of dataSet) {
        let vect = getFeatureVector(p.toLowerCase());
        // console.log(vect);
        for (i = 0; i < 6; i++) {
            if (vect[i] == nameVect[i]) {
                sum[i] += 1;
            }
        }
    }
    // console.log(sum);
    let prob = 1;
    for (let j = 0; j < 6; j++) {
        prob *= (sum[j] / len);
    }
    return prob;
}


calculateLoss();
function calculateLoss() {
    let loss = 0;
    let data = [boys, girls, dogs];
    for (let i = 0; i < 3; i++) {
        let classLoss = 0;
        for (let name of data[i]) {
            let label = getLabel(name.toLowerCase());
            // console.log(label);
            if (label != i) {
                loss += 1;
                classLoss += 1
            }
        }
        console.log(i, classLoss);
    }
    console.log(loss);
    console.log(loss / 214, '%');
}


