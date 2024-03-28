package main

import (
"fmt"

    "github.com/iden3/go-schema-processor/v2/merklize"
    "github.com/iden3/go-schema-processor/v2/utils"

)

const PathToSubjectType = "https://www.w3.org/2018/credentials#credentialSubject"

func main() {
typ := "IDScan"
jsonLDschemaBytes := []byte(`{"@context":[{"@protected":true,"@version":1.1,"id":"@id","type":"@type","IDScan":{"@context":{"@propagate":true,"@protected":true,"polygon-vocab":"urn:uuid:58acdc49-1a7d-45ff-bf8d-67c55831453b#","xsd":"http://www.w3.org/2001/XMLSchema#","highLevelResult":{"@id":"polygon-vocab:highLevelResult","@type":"xsd:string"},"journeyId":{"@id":"polygon-vocab:journeyId","@type":"xsd:string"},"firstName":{"@id":"polygon-vocab:firstName","@type":"xsd:string"},"middleName":{"@id":"polygon-vocab:middleName","@type":"xsd:string"},"lastName":{"@id":"polygon-vocab:lastName","@type":"xsd:string"},"gender":{"@id":"polygon-vocab:gender","@type":"xsd:string"},"age":{"@id":"polygon-vocab:age","@type":"xsd:integer"},"citizenship":{"@id":"polygon-vocab:citizenship","@type":"xsd:string"},"documentCategory":{"@id":"polygon-vocab:documentCategory","@type":"xsd:string"},"documentName":{"@id":"polygon-vocab:documentName","@type":"xsd:string"},"documentSide":{"@id":"polygon-vocab:documentSide","@type":"xsd:string"},"documentType":{"@id":"polygon-vocab:documentType","@type":"xsd:string"},"entryDate":{"@id":"polygon-vocab:entryDate","@type":"xsd:string"},"entryTime":{"@id":"polygon-vocab:entryTime","@type":"xsd:string"},"fullName":{"@id":"polygon-vocab:fullName","@type":"xsd:string"},"addressLine1":{"@id":"polygon-vocab:addressLine1","@type":"xsd:string"},"addressLine2":{"@id":"polygon-vocab:addressLine2","@type":"xsd:string"},"birthDate":{"@id":"polygon-vocab:birthDate","@type":"xsd:string"},"birthPlace":{"@id":"polygon-vocab:birthPlace","@type":"xsd:string"},"faceMatchScore":{"@id":"polygon-vocab:faceMatchScore","@type":"xsd:string"},"qualityCheckDetails":{"@id":"polygon-vocab:qualityCheckDetails","@context":{"id":{"@id":"polygon-vocab:qualityCheckDetails.id","@type":"xsd:string"},"title":{"@id":"polygon-vocab:qualityCheckDetails.title","@type":"xsd:string"},"description":{"@id":"polygon-vocab:qualityCheckDetails.description","@type":"xsd:string"},"state":{"@id":"polygon-vocab:qualityCheckDetails.state","@type":"xsd:integer"}}},"validationDetails":{"@id":"polygon-vocab:validationDetails","@context":{"name":{"@id":"polygon-vocab:validationDetails.name","@type":"xsd:string"},"description":{"@id":"polygon-vocab:validationDetails.description","@type":"xsd:string"},"result":{"@id":"polygon-vocab:validationDetails.result","@type":"xsd:integer"}}},"highLevelResultDetails":{"@context":{"documentOverallValidation":{"@id":"polygon-vocab:documentOverallValidation","@type":"xsd:string"},"documentBlockingPolicy":{"@id":"polygon-vocab:documentBlockingPolicy","@type":"xsd:string"},"documentExpiry":{"@id":"polygon-vocab:documentExpiry","@type":"xsd:string"},"documentSupport":{"@id":"polygon-vocab:documentSupport","@type":"xsd:string"},"documentValidation":{"@id":"polygon-vocab:documentValidation","@type":"xsd:string"},"faceMatchValidation":{"@id":"polygon-vocab:faceMatchValidation","@type":"xsd:string"},"accumulativeLivenessResult":{"@id":"polygon-vocab:accumulativeLivenessResult","@type":"xsd:string"}},"@id":"polygon-vocab:highLevelResultDetails"}},"@id":"urn:uuid:362d5804-a195-4549-b15b-edb5ef50d203"}}]}`)
fieldName := "age" // in form of field.field2.field3 field must be present in the credential subject

    schemaID, err := merklize.TypeIDFromContext(jsonLDschemaBytes, typ)
    if err != nil {
    	panic(err)
    }
    querySchema := utils.CreateSchemaHash([]byte(schemaID))
    fmt.Println(querySchema.BigInt().String())

    path, err := merklize.NewFieldPathFromContext(jsonLDschemaBytes, typ, fieldName)
    if err != nil {
    	panic(err)
    }
    err = path.Prepend(PathToSubjectType)
    if err != nil {
    	panic(err)
    }
    mkPath, err := path.MtEntry()
    if err != nil {
    	panic(err)
    }
    fmt.Println("claim path key")
    fmt.Println(mkPath.String())

}
