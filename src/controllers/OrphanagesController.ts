import { getRepository } from "typeorm";
import Orphanages from "../models/Orphanage";
import { Request, Response } from "express";
import orphanageView from '../views/ophanages_view';
import * as Yup from 'yup';

export default {
  async create(request: Request, response: Response) {
    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends,
    } = request.body;

    const orphanageRepository = getRepository(Orphanages);

    const requestImages = request.files as Express.Multer.File[];
    const images = requestImages.map(image => {
      return {path: image.filename}
    })

     const data ={
      name,
      latitude,
      longitude,
      about,
      instructions,
      open_on_weekends: open_on_weekends === 'true',
      opening_hours,
      images
     }

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        latitude: Yup.number().required(),
        longitude: Yup.number().required(),
        about: Yup.string().required().max(300) ,
        instructions: Yup.string().required(),
        open_on_weekends : Yup.boolean().required(),
        opening_hours : Yup.string().required(),
        images: Yup.array(Yup.object().shape({
           path: Yup.string().required()
        }))   
      })

     await schema.validate(data, {
        abortEarly: false
     })
   

    const orphanage = orphanageRepository.create(data);

    const resp = await orphanageRepository.save(orphanage);

    return response.json(resp);
  },

  async index(request: Request, response: Response) {
    const orphanageRepository = getRepository(Orphanages);
    const orphanagesList = await orphanageRepository.find({
      relations:['images']
    });
    return response.json(orphanageView.renderMany(orphanagesList));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const orphanageRepository = getRepository(Orphanages);
    const orphanages = await orphanageRepository.findOneOrFail(id,{
      relations:['images']
    });
    return response.json(orphanageView.render(orphanages));
  },
};
