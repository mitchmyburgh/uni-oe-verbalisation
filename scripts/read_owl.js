'use strict';

let fs = require('fs');
let xml2js = require('xml2js');
var shortid = require('shortid');

//load the language translations
//let language = "simpleEnglish";
let languages = {};
languages["simpleEnglish"] = require('./english/simpleEnglish');
languages["technicalEnglish"] = require('./english/technicalEnglish');
languages["Afrikaans"] = require('./afrikaans/Afrikaans');
languages["Tswana"] = require('./tswana/Tswana');
languages["maths"] = require('./maths/maths');

//language in plain text
let fullLang = {
  simpleEnglish: "Simple English",
  technicalEnglish: "Technical English",
  Afrikaans: "Afrikaans",
  Tswana: "Tswana",
  maths: "Mathematical Representation"
}

let read_file = function(filename, filepath, language, cb){
  var parser = new xml2js.Parser();
  fs.readFile(filepath, function(err, data) {
    parser.parseString(data, function (err, result) {
      //interface text
      let intText = {}
      //class tree structure
      let classTree = {};
      let outClassTree = [];
      //relationship tree structure
      let relTree = {};
      let outRelTree = [];
      //named Entity tree structure
      let neTree = {};
      let outNeTree = [];
      //Write interface text translations
      intText.classText = languages[language].classText();
      intText.objectPropertyText = languages[language].objectPropertyText();
      intText.namedEntitiesText = languages[language].namedEntitiesText();
      intText.headerText = filename+" in "+fullLang[language];
      //list all clases
      if (result["Ontology"]["Declaration"]){
        for (let i = 0; i < result["Ontology"]["Declaration"].length; i++){
          if (result["Ontology"]["Declaration"][i]["Class"]){
            let clas = result["Ontology"]["Declaration"][i]["Class"][0]["$"]["IRI"];
            classTree[clas.replace("#", "")] = {
              id: clas.replace("#", "class_"),
              text: clas.replace("#", ""),
              icon: "img/class.png",
              state: {opened: false, disabled: false, selected: false},
              children: [],
              li_attr: {},
              a_attr: {href: clas+"_describe"},
              displayOutput: {},
              used: false
            };
            !classTree[clas.replace("#", "")].displayOutput.subClassOf ? classTree[clas.replace("#", "")].displayOutput.subClassOf = [languages[language].subClassText()] : null;
            !classTree[clas.replace("#", "")].displayOutput.disjointWith ? classTree[clas.replace("#", "")].displayOutput.disjointWith = [languages[language].disjointWithText()] : null;
            !classTree[clas.replace("#", "")].displayOutput.instances ? classTree[clas.replace("#", "")].displayOutput.instances = [languages[language].instancesText()] : null;
            !classTree[clas.replace("#", "")].displayOutput.equivalentClasses ? classTree[clas.replace("#", "")].displayOutput.equivalentClasses = [languages[language].equivalentClassesText()] : null;
          }
        }
        //list all relations
        for (let i = 0; i < result["Ontology"]["Declaration"].length; i++){
          if (result["Ontology"]["Declaration"][i]["ObjectProperty"]){
            let rel = result["Ontology"]["Declaration"][i]["ObjectProperty"][0]["$"]["IRI"];
            relTree[rel.replace("#", "")] = {
              id: rel.replace("#", "rel_"),
              text: rel.replace("#", ""),
              icon: "img/relation.png",
              state: {opened: false, disabled: false, selected: false},
              children: [],
              li_attr: {},
              a_attr: {href: rel+"_describe"},
              displayOutput: {},
              used: false
            };
            !relTree[rel.replace("#", "")].displayOutput.equivalentRelations ? relTree[rel.replace("#", "")].displayOutput.equivalentRelations = [languages[language].equivalentRelationsText()] : null;
            !relTree[rel.replace("#", "")].displayOutput.subPropertyOf ? relTree[rel.replace("#", "")].displayOutput.subPropertyOf = [languages[language].subPropertyText()] : null;
            !relTree[rel.replace("#", "")].displayOutput.inverseOf ? relTree[rel.replace("#", "")].displayOutput.inverseOf = [languages[language].inverseOfText()] : null;
            !relTree[rel.replace("#", "")].displayOutput.characteristics ? relTree[rel.replace("#", "")].displayOutput.characteristics = [languages[language].characteristicsText()] : null;
            !relTree[rel.replace("#", "")].displayOutput.domainAndRange ? relTree[rel.replace("#", "")].displayOutput.domainAndRange = [languages[language].domainAndRangeText()] : null;
            !relTree[rel.replace("#", "")].displayOutput.disjointWithOP ? relTree[rel.replace("#", "")].displayOutput.disjointWithOP = [languages[language].disjointWithOPText()] : null;
            !relTree[rel.replace("#", "")].displayOutput.subPropertyOfChaining ? relTree[rel.replace("#", "")].displayOutput.subPropertyOfChaining = [languages[language].subPropertyOfChainingText()] : null;
          }
        }

        //list all named entities
        for (let i = 0; i < result["Ontology"]["Declaration"].length; i++){
          if (result["Ontology"]["Declaration"][i]["NamedIndividual"]){
            let ne = result["Ontology"]["Declaration"][i]["NamedIndividual"][0]["$"]["IRI"];
            neTree[ne.replace("#", "")] = {
              id: ne.replace("#", "ne_"),
              text: ne.replace("#", ""),
              icon: "img/individ.png",
              state: {opened: false, disabled: false, selected: false},
              children: [],
              li_attr: {},
              a_attr: {href: ne+"_describe"},
              displayOutput: {},
              used: false
            };
            !neTree[ne.replace("#", "")].displayOutput.subObjectOf ? neTree[ne.replace("#", "")].displayOutput.subObjectOf = [languages[language].subObjectText()] : null;
            !neTree[ne.replace("#", "")].displayOutput.sameIndividual ? neTree[ne.replace("#", "")].displayOutput.sameIndividual = [languages[language].sameIndividualText()] : null;
            !neTree[ne.replace("#", "")].displayOutput.differentIndividuals ? neTree[ne.replace("#", "")].displayOutput.differentIndividuals = [languages[language].differentIndividualsText()] : null;
            !neTree[ne.replace("#", "")].displayOutput.negativeObjectPropertyAssertion ? neTree[ne.replace("#", "")].displayOutput.negativeObjectPropertyAssertion = [languages[language].negativeObjectPropertyAssertionText()] : null;
            !neTree[ne.replace("#", "")].displayOutput.objectPropertyAssertion ? neTree[ne.replace("#", "")].displayOutput.objectPropertyAssertion = [languages[language].objectPropertyAssertionText()] : null;
          }
        }
      }
      //create text entries for sub classes + build tree structure
      var classTree2 = JSON.parse(JSON.stringify(classTree));
      if (result["Ontology"]["SubClassOf"]){
        for (let i = 0; i < result["Ontology"]["SubClassOf"].length; i++){
          if (result["Ontology"]["SubClassOf"][i]["Class"].length >1){
            let subC = result["Ontology"]["SubClassOf"][i]["Class"][0]["$"]["IRI"].replace("#", "");
            let superC = result["Ontology"]["SubClassOf"][i]["Class"][1]["$"]["IRI"].replace("#", "");
            classTree[subC].displayOutput.subClassOf.push(languages[language].subClassOf(subC, superC));
            if (classTree[subC].used){
              classTree[subC].id+= shortid.generate();
            }
            classTree[superC].children.push(classTree[subC]);
            classTree[subC].used = true;
          }
        }
      }
      //Equivalent Classes
      if (result["Ontology"]["EquivalentClasses"]){
        for (let i = 0; i < result["Ontology"]["EquivalentClasses"].length; i++){
          let subC = result["Ontology"]["EquivalentClasses"][i]["Class"][0]["$"]["IRI"].replace("#", "");
          let superC = result["Ontology"]["EquivalentClasses"][i]["Class"][1]["$"]["IRI"].replace("#", "");
          classTree[subC].displayOutput.equivalentClasses.push(languages[language].equivalentClasses(subC, superC));
        }
      }
      //Disjoint Classes
      if (result["Ontology"]["DisjointClasses"]){
        for (let i = 0; i < result["Ontology"]["DisjointClasses"].length; i++){
          let subC = result["Ontology"]["DisjointClasses"][i]["Class"][0]["$"]["IRI"].replace("#", "");
          classTree[subC].displayOutput.disjointWith.push(languages[language].disjointWith(result["Ontology"]["DisjointClasses"][i]["Class"]));
        }
      }
      //object relation restrictions
      if (result["Ontology"]["SubClassOf"]) {
        for (let i = 0; i < result["Ontology"]["SubClassOf"].length; i++){
          let subC = result["Ontology"]["SubClassOf"][i]["Class"][0]["$"]["IRI"].replace("#", "");
          if (result["Ontology"]["SubClassOf"][i]["ObjectSomeValuesFrom"]){
            let superC = result["Ontology"]["SubClassOf"][i]["ObjectSomeValuesFrom"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["SubClassOf"][i]["ObjectSomeValuesFrom"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            classTree[subC].displayOutput.subClassOf.push(languages[language].someValuesFrom(subC, superC, rel));
          } else if (result["Ontology"]["SubClassOf"][i]["ObjectAllValuesFrom"]){
            let superC = result["Ontology"]["SubClassOf"][i]["ObjectAllValuesFrom"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["SubClassOf"][i]["ObjectAllValuesFrom"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            classTree[subC].displayOutput.subClassOf.push(languages[language].allValuesFrom(subC, superC, rel));
          } else if (result["Ontology"]["SubClassOf"][i]["ObjectExactCardinality"]){
            let superC = result["Ontology"]["SubClassOf"][i]["ObjectExactCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["SubClassOf"][i]["ObjectExactCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["SubClassOf"][i]["ObjectExactCardinality"][0]["$"]["cardinality"];
            classTree[subC].displayOutput.subClassOf.push(languages[language].exactCardinality(subC, superC, rel, card));
          } else if (result["Ontology"]["SubClassOf"][i]["ObjectMinCardinality"]){
            let superC = result["Ontology"]["SubClassOf"][i]["ObjectMinCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["SubClassOf"][i]["ObjectMinCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["SubClassOf"][i]["ObjectMinCardinality"][0]["$"]["cardinality"];
            classTree[subC].displayOutput.subClassOf.push(languages[language].minCardinality(subC, superC, rel, card));
          } else if (result["Ontology"]["SubClassOf"][i]["ObjectMaxCardinality"]){
            let superC = result["Ontology"]["SubClassOf"][i]["ObjectMaxCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["SubClassOf"][i]["ObjectMaxCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["SubClassOf"][i]["ObjectMaxCardinality"][0]["$"]["cardinality"];
            classTree[subC].displayOutput.subClassOf.push(languages[language].maxCardinality(subC, superC, rel, card));
          }
        }
      }
      //create text entries for sub relations + build tree structure
      if (result["Ontology"]["SubObjectPropertyOf"]){
        for (let i = 0; i < result["Ontology"]["SubObjectPropertyOf"].length; i++){
          let subC = result["Ontology"]["SubObjectPropertyOf"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          if (result["Ontology"]["SubObjectPropertyOf"][i]["ObjectProperty"].length > 1) {
            let superC = result["Ontology"]["SubObjectPropertyOf"][i]["ObjectProperty"][1]["$"]["IRI"].replace("#", "");
            relTree[subC].displayOutput.subPropertyOf.push(languages[language].subPropertyOf(subC, superC));
            if (relTree[subC].used){
              relTree[subC].id+= shortid.generate();
            }
            relTree[superC].children.push(relTree[subC]);
            relTree[subC].used = true;
          }
        }
      }
      //Equivalent Object Properties
      if (result["Ontology"]["EquivalentObjectProperties"]){
        for (let i = 0; i < result["Ontology"]["EquivalentObjectProperties"].length; i++){
          let subR = result["Ontology"]["EquivalentObjectProperties"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          let superR = result["Ontology"]["EquivalentObjectProperties"][i]["ObjectProperty"][1]["$"]["IRI"].replace("#", "");
          relTree[subR].displayOutput.equivalentRelations.push(languages[language].equivalentRelations(subR, superR));
        }
      }
      // inverse relations
      if (result["Ontology"]["InverseObjectProperties"]){
        for (let i = 0; i < result["Ontology"]["InverseObjectProperties"].length; i++){
          let subR = result["Ontology"]["InverseObjectProperties"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          let superR = result["Ontology"]["InverseObjectProperties"][i]["ObjectProperty"][1]["$"]["IRI"].replace("#", "");
          relTree[subR].displayOutput.inverseOf.push(languages[language].inverseOf(subR, superR));
        }
      }
      // domain
      //create text entries for sub classes + build tree structure
      var relDomain = {};
      if (result["Ontology"]["ObjectPropertyDomain"]){
        for (let i = 0; i < result["Ontology"]["ObjectPropertyDomain"].length; i++){
          if (result["Ontology"]["ObjectPropertyDomain"][i]["Class"]){
            let subC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let superC = result["Ontology"]["ObjectPropertyDomain"][i]["Class"][0]["$"]["IRI"].replace("#", "");
            relDomain[subC] ? relDomain[subC]+=languages[language].domain(superC): relDomain[subC] = languages[language].domainPre(subC)+languages[language].domain(superC);
          }
        }
      }
      //domain some, all, max, min, exactly
      if (result["Ontology"]["ObjectPropertyDomain"]) {
        for (let i = 0; i < result["Ontology"]["ObjectPropertyDomain"].length; i++){
          let subC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          if (result["Ontology"]["ObjectPropertyDomain"][i]["ObjectSomeValuesFrom"]){
            let superC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectSomeValuesFrom"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectSomeValuesFrom"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            relDomain[subC] ? relDomain[subC]+=languages[language].domainSome(rel, superC): relDomain[subC] = languages[language].domainPre(subC)+languages[language].domainSome(rel, superC);
          } else if (result["Ontology"]["ObjectPropertyDomain"][i]["ObjectAllValuesFrom"]){
            let superC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectAllValuesFrom"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectAllValuesFrom"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            relDomain[subC] ? relDomain[subC]+=languages[language].domainAll(rel, superC): relDomain[subC] = languages[language].domainPre(subC)+languages[language].domainAll(rel, superC);
          } else if (result["Ontology"]["ObjectPropertyDomain"][i]["ObjectExactCardinality"]){
            let superC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectExactCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectExactCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectExactCardinality"][0]["$"]["cardinality"];
            relDomain[subC] ? relDomain[subC]+=languages[language].domainExactly(rel, superC, card): relDomain[subC] = languages[language].domainPre(subC)+languages[language].domainExactly(rel, superC, card);
          } else if (result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMinCardinality"]){
            let superC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMinCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMinCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMinCardinality"][0]["$"]["cardinality"];
            relDomain[subC] ? relDomain[subC]+=languages[language].domainMin(rel, superC, card): relDomain[subC] = languages[language].domainPre(subC)+languages[language].domainMin(rel, superC, card);
          } else if (result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMaxCardinality"]){
            let superC = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMaxCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMaxCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["ObjectPropertyDomain"][i]["ObjectMaxCardinality"][0]["$"]["cardinality"];
            relDomain[subC] ? relDomain[subC]+=languages[language].domainMax(rel, superC, card): relDomain[subC] = languages[language].domainPre(subC)+languages[language].domainMax(rel, superC, card);
          }
        }
      }
      //range
      var relRange = {};
      if (result["Ontology"]["ObjectPropertyRange"]){
        for (let i = 0; i < result["Ontology"]["ObjectPropertyRange"].length; i++){
          if (result["Ontology"]["ObjectPropertyRange"][i]["Class"]){
            let subC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let superC = result["Ontology"]["ObjectPropertyRange"][i]["Class"][0]["$"]["IRI"].replace("#", "");
            relRange[subC] ? relRange[subC]+=languages[language].range(superC): relRange[subC] = languages[language].rangePre(subC)+languages[language].range(superC);
          }
        }
      }
      //range some, all, max, min, exactly
      if (result["Ontology"]["ObjectPropertyRange"]){
        for (let i = 0; i < result["Ontology"]["ObjectPropertyRange"].length; i++){
          let subC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          if (result["Ontology"]["ObjectPropertyRange"][i]["ObjectSomeValuesFrom"]){
            let superC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectSomeValuesFrom"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyRange"][i]["ObjectSomeValuesFrom"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            relRange[subC] ? relRange[subC]+=languages[language].rangeSome(rel, superC): relRange[subC] = languages[language].rangePre(subC)+languages[language].rangeSome(rel, superC);
          } else if (result["Ontology"]["ObjectPropertyRange"][i]["ObjectAllValuesFrom"]){
            let superC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectAllValuesFrom"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyRange"][i]["ObjectAllValuesFrom"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            relRange[subC] ? relRange[subC]+=languages[language].rangeAll(rel, superC): relRange[subC] = languages[language].rangePre(subC)+languages[language].rangeAll(rel, superC);
          } else if (result["Ontology"]["ObjectPropertyRange"][i]["ObjectExactCardinality"]){
            let superC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectExactCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyRange"][i]["ObjectExactCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["ObjectPropertyRange"][i]["ObjectExactCardinality"][0]["$"]["cardinality"];
            relRange[subC] ? relRange[subC]+=languages[language].rangeExactly(rel, superC, card): relRange[subC] = languages[language].rangePre(subC)+languages[language].rangeExactly(rel, superC, card);
          } else if (result["Ontology"]["ObjectPropertyRange"][i]["ObjectMinCardinality"]){
            let superC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectMinCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyRange"][i]["ObjectMinCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["ObjectPropertyRange"][i]["ObjectMinCardinality"][0]["$"]["cardinality"];
            relRange[subC] ? relRange[subC]+=languages[language].rangeMin(rel, superC, card): relRange[subC] = languages[language].rangePre(subC)+languages[language].rangeMin(rel, superC, card);
          } else if (result["Ontology"]["ObjectPropertyRange"][i]["ObjectMaxCardinality"]){
            let superC = result["Ontology"]["ObjectPropertyRange"][i]["ObjectMaxCardinality"][0]["Class"][0]["$"]["IRI"].replace("#", "");
            let rel = result["Ontology"]["ObjectPropertyRange"][i]["ObjectMaxCardinality"][0]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
            let card = result["Ontology"]["ObjectPropertyRange"][i]["ObjectMaxCardinality"][0]["$"]["cardinality"];
            relRange[subC] ? relRange[subC]+=languages[language].rangeMax(rel, superC, card): relRange[subC] = languages[language].rangePre(subC)+languages[language].rangeMax(rel, superC, card);
          }
        }
      }
      //build domain and range strings
      for (var key in relDomain) {
        if (relDomain.hasOwnProperty(key)) {
          if (relRange[key]){
            relTree[key].displayOutput.domainAndRange.push(languages[language].domainPost(relDomain[key], key)+languages[language].rangePost(relRange[key]));
            relRange[key] = null;
          } else {
            relTree[key].displayOutput.domainAndRange.push(languages[language].domainPostNoR(relDomain[key], key));
          }
        }
      }
      for (var key in relRange) {
        if (relRange.hasOwnProperty(key)) {
          if (relRange[key]){
            relTree[key].displayOutput.domainAndRange.push(languages[language].rangePreNoD(relRange[key], key));
          }
        }
      }
      //Disjoint Relations
      if (result["Ontology"]["DisjointObjectProperties"]){
        for (let i = 0; i < result["Ontology"]["DisjointObjectProperties"].length; i++){
          let subC = result["Ontology"]["DisjointObjectProperties"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[subC].displayOutput.disjointWithOP.push(languages[language].disjointWithOP(result["Ontology"]["DisjointObjectProperties"][i]["ObjectProperty"]));
        }
      }
      // sub property chaining
      if (result["Ontology"]["SubObjectPropertyOf"]){
        for (let i = 0; i < result["Ontology"]["SubObjectPropertyOf"].length; i++){
          let subC = result["Ontology"]["SubObjectPropertyOf"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          if (result["Ontology"]["SubObjectPropertyOf"][i]["ObjectPropertyChain"]) {
            relTree[subC].displayOutput.subPropertyOfChaining.push(languages[language].subPropertyOfChaining(subC, result["Ontology"]["SubObjectPropertyOf"][i]["ObjectPropertyChain"][0]["ObjectProperty"]));
          }
        }
      }
      // Characteristics
      // Functional char
      if (result["Ontology"]["FunctionalObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["FunctionalObjectProperty"].length; i++){
          let rel = result["Ontology"]["FunctionalObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsFunctional(rel));
        }
      }
      //inverse functional
      if (result["Ontology"]["InverseFunctionalObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["InverseFunctionalObjectProperty"].length; i++){
          let rel = result["Ontology"]["InverseFunctionalObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsInverseFunctional(rel));
        }
      }
      //symmetric
      if (result["Ontology"]["SymmetricObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["SymmetricObjectProperty"].length; i++){
          let rel = result["Ontology"]["SymmetricObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsSymmetric(rel));
        }
      }
      //asymmetric
      if (result["Ontology"]["AsymmetricObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["AsymmetricObjectProperty"].length; i++){
          let rel = result["Ontology"]["AsymmetricObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsAsymmetric(rel));
        }
      }
      //Transitive
      if (result["Ontology"]["TransitiveObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["TransitiveObjectProperty"].length; i++){
          let rel = result["Ontology"]["TransitiveObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsTransitive(rel));
        }
      }
      //Reflexive
      if (result["Ontology"]["ReflexiveObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["ReflexiveObjectProperty"].length; i++){
          let rel = result["Ontology"]["ReflexiveObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsReflexive(rel));
        }
      }
      //irreflexive
      if (result["Ontology"]["IrreflexiveObjectProperty"]){
        for (let i = 0; i < result["Ontology"]["IrreflexiveObjectProperty"].length; i++){
          let rel = result["Ontology"]["IrreflexiveObjectProperty"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          relTree[rel].displayOutput.characteristics.push(languages[language].characteristicsIrreflexive(rel));
        }
      }
      //ne same individual
      if (result["Ontology"]["SameIndividual"]){
        for (let i = 0; i < result["Ontology"]["SameIndividual"].length; i++){
          let subC = result["Ontology"]["SameIndividual"][i]["NamedIndividual"][0]["$"]["IRI"].replace("#", "");
          neTree[subC].displayOutput.sameIndividual.push(languages[language].sameIndividual(result["Ontology"]["SameIndividual"][i]["NamedIndividual"]));
        }
      }
      //ne same individual
      if (result["Ontology"]["DifferentIndividuals"]){
        for (let i = 0; i < result["Ontology"]["DifferentIndividuals"].length; i++){
          let subC = result["Ontology"]["DifferentIndividuals"][i]["NamedIndividual"][0]["$"]["IRI"].replace("#", "");
          neTree[subC].displayOutput.differentIndividuals.push(languages[language].differentIndividuals(result["Ontology"]["DifferentIndividuals"][i]["NamedIndividual"]));
        }
      }
      // ne negative object property assertions
      if (result["Ontology"]["NegativeObjectPropertyAssertion"]){
        for (let i = 0; i < result["Ontology"]["NegativeObjectPropertyAssertion"].length; i++){
          let subC = result["Ontology"]["NegativeObjectPropertyAssertion"][i]["NamedIndividual"][0]["$"]["IRI"].replace("#", "");
          let superC = result["Ontology"]["NegativeObjectPropertyAssertion"][i]["NamedIndividual"][1]["$"]["IRI"].replace("#", "");
          let rel = result["Ontology"]["NegativeObjectPropertyAssertion"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          neTree[subC].displayOutput.negativeObjectPropertyAssertion.push(languages[language].negativeObjectPropertyAssertion(subC, superC, rel));
        }
      }
      // ne object property assertions
      if (result["Ontology"]["ObjectPropertyAssertion"]){
        for (let i = 0; i < result["Ontology"]["ObjectPropertyAssertion"].length; i++){
          let subC = result["Ontology"]["ObjectPropertyAssertion"][i]["NamedIndividual"][0]["$"]["IRI"].replace("#", "");
          let superC = result["Ontology"]["ObjectPropertyAssertion"][i]["NamedIndividual"][1]["$"]["IRI"].replace("#", "");
          let rel = result["Ontology"]["ObjectPropertyAssertion"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          neTree[subC].displayOutput.objectPropertyAssertion.push(languages[language].objectPropertyAssertion(subC, superC, rel));
        }
      }
      //create text entries for sub objects + build tree structure
      if (result["Ontology"]["ClassAssertion"]){
        for (let i = 0; i < result["Ontology"]["ClassAssertion"].length; i++){
          let subC = result["Ontology"]["ClassAssertion"][i]["NamedIndividual"][0]["$"]["IRI"].replace("#", "");
          let superC = result["Ontology"]["ClassAssertion"][i]["Class"][0]["$"]["IRI"].replace("#", "");
          neTree[subC].displayOutput.subObjectOf.push(languages[language].subObjectOf(subC, superC));
          classTree[superC].displayOutput.instances.push(languages[language].instances(subC, superC));
          classTree2[superC].children.push(neTree[subC]);
          neTree[subC].used = true;
        }
      }

      //complete tree structure for ne tree
      if (result["Ontology"]["SubClassOf"]){
        for (let i = 0; i < result["Ontology"]["SubClassOf"].length; i++){
          if (result["Ontology"]["SubClassOf"][i]["Class"].length >1){
            let subC = result["Ontology"]["SubClassOf"][i]["Class"][0]["$"]["IRI"].replace("#", "");
            let superC = result["Ontology"]["SubClassOf"][i]["Class"][1]["$"]["IRI"].replace("#", "");
            classTree2[subC].displayOutput.subClassOf.push(languages[language].subClassOf(subC, superC));
            if (classTree2[subC].used){
              classTree2[subC].id+= shortid.generate();
            }
            classTree2[superC].children.push(classTree2[subC]);
            classTree2[subC].used = true;
          }
        }
      }

      //remove class root nodes that are used elsewhere in the tree
      if (result["Ontology"]["SubClassOf"]){
        for (let i = 0; i < result["Ontology"]["SubClassOf"].length; i++){
          let subC = result["Ontology"]["SubClassOf"][i]["Class"][0]["$"]["IRI"].replace("#", "");
          if (classTree[subC] && classTree[subC].used) {
            classTree[subC] = null;
          }
        }
      }
      //remove rel root nodes that are used elsewhere in the tree
      if (result["Ontology"]["SubObjectPropertyOf"]){
        for (let i = 0; i < result["Ontology"]["SubObjectPropertyOf"].length; i++){
          let subC = result["Ontology"]["SubObjectPropertyOf"][i]["ObjectProperty"][0]["$"]["IRI"].replace("#", "");
          if (relTree[subC] && relTree[subC].used) {
            relTree[subC] = null;
          }
        }
      }
      //remove named entities root nodes that are used elsewhere in the tree
      if (result["Ontology"]["SubClassOf"]){
        for (let i = 0; i < result["Ontology"]["SubClassOf"].length; i++){
          let subC = result["Ontology"]["SubClassOf"][i]["Class"][0]["$"]["IRI"].replace("#", "");
          if (classTree2[subC]) {
            classTree2[subC].id = classTree2[subC].id+'_ne';
          }
          if (classTree2[subC] && classTree2[subC].used) {
            classTree2[subC] = null;
          }
        }
      }
      classTree = JSON.parse(JSON.stringify(classTree));
      changeIds(classTree);
      relTree = JSON.parse(JSON.stringify(relTree));
      changeIds(relTree);
      classTree2 = JSON.parse(JSON.stringify(classTree2));
      changeIds(classTree2);
      //make class tree into list
      for (var key in classTree) {
        if (classTree.hasOwnProperty(key)) {
          classTree[key] ? outClassTree.push(classTree[key]) : null;
        }
      }
      //make rel tree into list
      for (var key in relTree) {
        if (relTree.hasOwnProperty(key)) {
          relTree[key] ? outRelTree.push(relTree[key]) : null;
        }
      }
      //make named entity tree into list
      for (var key in classTree2) {
        if (classTree2.hasOwnProperty(key)) {
          classTree2[key] ? outNeTree.push(classTree2[key]) : null;
        }
      }
      console.log('Done');
      write_file(filename+".js", [intText, outClassTree, outRelTree, outNeTree], function (path){
        cb(path);
      });
    });
  });
}

function changeIds(obj)
{
  for (var k in obj)
  {
    if (!obj.hasOwnProperty(k))
        continue;
    if (typeof obj[k] == "object" && obj[k] !== null && obj[k].hasOwnProperty("id")){
      obj[k].id = shortid.generate();
      changeIds(obj[k].children);
    } else if (obj[k] !== null && obj[k].hasOwnProperty("id")) {
      obj[k].id = shortid.generate();
    }
  }
}

let write_file = function (filename, trees, cb) {
  let string = "var tree = "+JSON.stringify(trees);
  console.log("../"+filename)
  fs.writeFile("./public/rendered/"+filename, string, function(err) {
    if(err) {
      return console.log(err);
    }

    cb("rendered/"+filename);
  });
}

module.exports = {read_file};
