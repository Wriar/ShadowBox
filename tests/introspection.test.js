/* eslint-disable no-undef */
import { listDirectoryStructure } from '../src/introspection.js';
import fs from 'fs';

const sampleFileStructurePath = "./tests/introspectionTestStructure";
const sampleFileStructure = [
    '2023-2024 stuff',
    'Documents',
    'Inspiration',
    'Pictures',
    'Videos',
    'Work/Letters',
    'Work/Presentations/Q1',
    'Work/Presentations/Q2',
    'Work/Presentations/Q3',
    'Work/Presentations/Q4',
    'Work/Presentations',
    'Work/Projects',
    'Work'
];

beforeAll(() => {
    // Create a folder in the current directory with the sample file structure.
    fs.mkdirSync(sampleFileStructurePath, { recursive: true });

    for (let i = 0; i < sampleFileStructure.length; i++) {
        const folderPath = `${sampleFileStructurePath}/${sampleFileStructure[i]}`;
        fs.mkdirSync(folderPath, { recursive: true });
    }
});

afterAll((done) => {
    fs.rmdir(sampleFileStructurePath, { recursive: true }, (err) => {
        if (err) {
            throw err;
        }
        done();
    });
});

describe('listDirectoryStructure', () => {
    test('Returns the correct file structure.', async () => {
        expect(await listDirectoryStructure(sampleFileStructurePath)).toEqual(sampleFileStructure);
    });
});