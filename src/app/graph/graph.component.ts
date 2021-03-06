import { Component, OnInit,ViewChild } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ChartComponent } from '@progress/kendo-angular-charts';
import { saveAs } from '@progress/kendo-file-saver';
import { exportPDF } from '@progress/kendo-drawing/pdf';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  tipoCaderno:string = "simulados";
  itemYear:any = [];
  closeResult: string;
  chaveAno :string;
  year:any = this.itemYear[0];
  perguntas: Observable<any[]>;
  perguntasModal: Observable<any[]>;
  dataYear:any = new Date().getFullYear();
  yearTotalSelect:Array<any> = [];
  yearTotalSelectSort:Array<any> = [];
  //======chart bar======
  graficoLegend: Observable<any[]>;
  graficoData: Observable<any[]>;
  dadosLegenda:Array<any> = [];
  dadosSeries:Array<any> = [];
  series = [];
  showChart:boolean = false;
  pergModal:any;
  //======================
  //======chart line======
  graficoLegendLineSimulado: Observable<any[]>;
  graficoLegendLineProva: Observable<any[]>;
  seriesLine = [];
  categoryLine = [];
  categoryLine2 = [];
   //==modal==============
   nameDisciplinaModal:string;

  constructor(public database:AngularFireDatabase,private modalService: NgbModal) { 

 // FOR PARA DADOS DO SELECT YEAR
 for(let x=0;x<20;x++)
 {
   this.yearTotalSelect.push(this.dataYear);
   this.dataYear--;
 }
this.yearTotalSelectSort=this.yearTotalSelect.sort();
 // =============SELECT===================
   this.perguntas = this.database.list(this.tipoCaderno).snapshotChanges().map(arr => {
      return arr.map(snap => Object.assign(snap.payload.val(), { $key: snap.key }) )
    }); 

this.perguntas.forEach(item => { 
  
  for(let x in item){        
    this.itemYear.push( item[x].ano );        
    }   
    this.year = item[0].ano;
});



}

consultar(){
  ///===========BARRA===========
  this.showChart = true;
  this.dadosLegenda = [];
  this.dadosSeries = [];
  this.series = [];
  this.seriesLine = [];
  this.categoryLine = [];
 
this.graficoLegend = this.database.list(this.tipoCaderno ).snapshotChanges().map(arr => {

  return arr.map(snap => Object.assign(snap.payload.val(), { $key: snap.key })).filter(i =>  Number(i.ano) ===  Number(this.year)   )
}); 



this.graficoLegend.forEach(item => { 
  //console.log('item',item);

  let aux = Object.keys(item[0].questions).length;
  
  for(let x=0;x<aux;x++) {
   
       // console.log(Object.keys(item[0].questions));
          this.dadosLegenda.push(Object.keys(item[0].questions)[x]);
          let my_obj = Object.create({}, { getFoo: { value: function() { return this.nome, this.valor;  } } });        
          my_obj.nome = Object.keys(item[0].questions)[x];
         
          my_obj.valor =JSON.parse("[" +  Object.keys(Object.values(item[0].questions )[x]).length + "]");
          this.series.push(my_obj);
    

    
}
//console.log(this.series);

});

///===========LINE===========
this.graficoLegendLineSimulado = this.database.list('simulados/').snapshotChanges().map(arr => {
  return arr.map(snap => Object.assign(snap.payload.val(), { $key: snap.key }) )
});
this.graficoLegendLineProva = this.database.list('provas/').snapshotChanges().map(arr => {
  return arr.map(snap => Object.assign(snap.payload.val(), { $key: snap.key }) )
});

//PROVA LINE
this.graficoLegendLineProva.forEach(item =>{
  this.categoryLine = [];
  let aux = 0;
  let my_obj = Object.create({}, { getFoo: { value: function() { return this.nome, this.valor;  } } });  
  my_obj.nome = 'Prova';
  let validaValores:any = [];
  validaValores = this.yearTotalSelect.sort();
  let totalValores:any = [];

  for(let x = 0;x<item.length;x++){
    this.categoryLine.push(item[x].ano);
    
  }
  for(let y= 0 ; y< validaValores.length;y++){
    totalValores.push("0");
  }

  for(let x = 0;x<item.length;x++){
    aux = 0;   
    //console.log('itens',item[x])  
    //console.log('objeto',Object.values(Object.values(item[x].questions)))
      for(let y = 0;y<Object.values(Object.values(item[x].questions)).length ;y++){
       
        aux +=  Object.keys(Object.values(Object.values(item[x].questions))[y]).length;
  
      }   
     
      totalValores[validaValores.indexOf(Number(item[x].ano))] = aux;     

      my_obj.valor =  totalValores ;     
   
  }
  this.seriesLine.push(my_obj);
 
});


//SIMULADO LINE
this.graficoLegendLineSimulado.forEach(item =>{
  this.categoryLine = [];
  let aux = 0;
  let my_obj = Object.create({}, { getFoo: { value: function() { return this.nome, this.valor;  } } });  
  my_obj.nome = 'Simulado';
  let validaValores:any = [];
  validaValores = this.yearTotalSelect.sort();
  let totalValores:any = [];

  for(let x = 0;x<item.length;x++){
    this.categoryLine.push(item[x].ano);
    
  }
  for(let y= 0 ; y< validaValores.length;y++){
    totalValores.push("0");
  }

  for(let x = 0;x<item.length;x++){
    aux = 0;   

      for(let y = 0;y<Object.values(Object.values(item[x].questions)).length ;y++){
        aux +=  Object.keys(Object.values(Object.values(item[x].questions))[y]).length;
   
      }

      totalValores[validaValores.indexOf(Number(item[x].ano))] = aux;    
      my_obj.valor =  totalValores ;     
  
  }
  this.seriesLine.push(my_obj);
 
});
//console.log('se', this.seriesLine)

}


changeYear(){
  this.showChart = false;
 
}

 changeTipoCaderno(){
   this.showChart = false;
 // =============PERGUNTAS===================
 this.perguntas = this.database.list(this.tipoCaderno).snapshotChanges().map(arr => {
  return arr.map(snap => Object.assign(snap.payload.val(), { $key: snap.key }) )
});


this.itemYear = [];
// select item
this.perguntas.forEach(item => { 
     
  for(let x in item){        
    this.itemYear.push(item[x].ano);        
    }   
    this.year =item[0].ano ;
});
//=======================================

 }
 clickChart(event,content){
  this.nameDisciplinaModal = event.series.name;
 // console.log(event)
  this.open(content);
 
  this.perguntasModal = this.database.list(this.tipoCaderno).snapshotChanges().map(arr => {
    return arr.map(snap => Object.assign(snap.payload.val(), { $key: snap.key }) ).filter(i =>  Number(i.ano) ===  Number(this.year)   ).map(u => u.questions[this.nameDisciplinaModal])
  });
this.perguntasModal.forEach(item => {
 // console.log(item)
  this.pergModal = item[0];

})
 }

 open(content) {

  this.modalService.open(content, { size: 'lg' }).result.then((result) => {
    this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });
 
}
private getDismissReason(reason: any): string {
  if (reason === ModalDismissReasons.ESC) {
    return 'by pressing ESC';
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    return 'by clicking on a backdrop';
  } else {
    return  `with: ${reason}`;
  }
}
 
  

  ngOnInit() {
    
   
   
 
 
    
  }

}